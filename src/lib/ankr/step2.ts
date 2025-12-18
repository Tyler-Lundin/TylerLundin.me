import { ANKR_ACTIONS, ANKR_CATEGORIES, type AnkrAnalysis, type AnkrStep1Response } from '@/lib/ankr/config'
import { generatePlanResponse } from '@/lib/ankr/openai'

function fmtKV(k: string, v: string) {
  return `  - ${k}: ${v}`
}

export type Step2Input = {
  step1: AnkrStep1Response
  originalMessage: string
  mode?: 'idea' | 'action'
}

export type Step2Output = {
  plan: {
    response: string
    decision: string
    recommendedActions: { name: string; args?: Record<string, any>; confidence: number }[]
    analysisOverrides?: any
    citations?: { id: string; locator?: string }[]
    reasoning?: string
    bypassNextStep?: boolean
  }
  assistantContent: string
}

export async function runStep2(input: Step2Input): Promise<Step2Output> {
  const { step1, originalMessage, mode } = input
  const { intent, messageAnalysis: ma, threadId, telemetry } = step1
  const header = `▶︎ ANKR STEP 2\n  In.thread: ${threadId || 'new'}\n  Flags: ${intent.flags.join(', ') || '(none)'}\n  Route: ${ma.route}\n  Intent: ${ma.intent} (${ma.intentConfidence.toFixed(2)})`

  const entities = (ma.entities || [])
    .slice(0, 20)
    .map((e) => `    • ${e.type}${e.kind && e.kind !== e.type ? `/${e.kind}` : ''}: ${e.value} (${(e.weight ?? 0).toFixed(2)})`)
    .join('\n') || '    (none)'

  const actions = (ma.suggestedActions || [])
    .map((a) => `    • ${a.name} (${(a.weight ?? 0).toFixed(2)})`)
    .join('\n') || '    (none)'

  const proposals = (ma.actionProposals || [])
    .map((p) => {
      const flags = [
        typeof (p as any).blocking === 'boolean' ? `blocking=${(p as any).blocking}` : undefined,
        Array.isArray((p as any).dependsOn) && (p as any).dependsOn.length ? `dependsOn=[${(p as any).dependsOn.join(', ')}]` : undefined,
      ].filter(Boolean).join(' ')
      const args = JSON.stringify(p.args || {})
      return `    • ${p.name} (${(p.weight ?? 0).toFixed(2)}) ${flags ? `[${flags}] ` : ''}- args: ${args}`
    })
    .join('\n') || '    (none)'

  const queries = (ma.retrievalQueries || [])
    .map((q) => `    • ${q}`)
    .join('\n') || '    (none)'

  const memory = (ma.memoryCandidates || [])
    .map((m) => `    • ${m.key}=${m.value} (${(m.weight ?? 0).toFixed(2)})`)
    .join('\n') || '    (none)'

  const inputs = [
    fmtKV('code', String(ma.hasCode)),
    fmtKV('err', String(ma.hasErrorLog)),
    fmtKV('trace', String(ma.hasStackTrace)),
    fmtKV('diff', String(ma.hasDiffPatch)),
    fmtKV('sql', String(ma.hasSQL)),
    fmtKV('cfg', String(ma.hasConfig)),
    fmtKV('mcfg', String((ma as any).mentionsConfig || false)),
    fmtKV('wantsArtifact', String((ma as any).wantsArtifact || false)),
    fmtKV('hasArtifact', String((ma as any).hasArtifact || false)),
    fmtKV('img', String(ma.hasScreenshotOrImageRef)),
    fmtKV('link', String(ma.hasLinks)),
  ].join('\n')

  const risks = [
    fmtKV('secrets', String(ma.containsSecretsRisk)),
    fmtKV('privacy', String(ma.privacyRisk)),
    fmtKV('pay', String(ma.paymentRisk)),
    fmtKV('legal', String(ma.legalRisk)),
  ].join('\n')

  const tail = `Telemetry: ${telemetry.totalMs} ms`

  const out = [
    header,
    '  Entities:',
    entities,
    '  Suggested Actions:',
    actions,
    '  Proposals:',
    proposals,
    '  Retrieval Queries:',
    queries,
    '  Inputs:',
    inputs,
    '  Risks:',
    risks,
    `  ${tail}`,
  ].join('\n')

  console.log(out)

  // Map Step 1 signal into a minimal AnkrAnalysis for Step 2
  const analysis: AnkrAnalysis = buildAnalysisFromStep1(step1)

  // Call model to generate a humanized response plan (actions optional)
  const plan = await generatePlanResponse({
    userMessage: originalMessage,
    analysis,
    actions: ANKR_ACTIONS,
    mode: mode || 'action',
  })

  // Ensure a friendly close: if the model didn't add a follow-up or sign-off, append one
  const msg = ensureFollowUpOrSignoff(plan.response)

  return { plan, assistantContent: msg }
}

function buildAnalysisFromStep1(step1: AnkrStep1Response): AnkrAnalysis {
  const ma = step1.messageAnalysis
  // Category mapping from flags/intent
  const f = new Set((step1.intent?.flags || []).map((x) => x.toUpperCase()))
  let category: typeof ANKR_CATEGORIES[number] = 'Other'
  if (f.has('BUG_REPORT') || f.has('SITE_ISSUE')) category = 'BugOrIssue'
  else if (f.has('CONTENT') || f.has('CHANGE_REQUEST')) category = 'ContentOrSEO'
  else if (f.has('CODE_WRITE') || f.has('CODE_DEBUG')) category = 'RefactorOrDX'
  else if (f.has('PLAN') || f.has('FEATURE_REQUEST')) category = 'PlanningOrTaskBreakdown'
  else if (ma.intent.toLowerCase().includes('question')) category = 'ResearchOrQuestion'

  const subjects = Array.isArray(step1.intent?.subjects) ? step1.intent.subjects.slice(0, 3).map((s) => s.label).filter(Boolean) : []
  const topEntities = (ma.entities || []).slice(0, 3).map((e) => e.value)
  const goalParts: string[] = []
  if (ma.primaryIntent) goalParts.push(ma.primaryIntent)
  if (ma.intent) goalParts.push(ma.intent)
  if (subjects.length) goalParts.push(subjects.join(', '))
  const goal = (goalParts.join(' — ') || 'Address user request').slice(0, 120)
  const relatedTo = [...subjects, ...topEntities].slice(0, 4)
  const confidence = typeof ma.intentConfidence === 'number' && isFinite(ma.intentConfidence) ? Math.max(0, Math.min(1, ma.intentConfidence)) : 0.6
  return { category, goal, relatedTo, confidence }
}

function ensureFollowUpOrSignoff(text: string): string {
  const t = String(text || '').trim()
  if (!t) return 'Got it — I can take this on. Anything else you want me to consider?'
  const lower = t.toLowerCase()
  const hasQuestion = /\?\s*$/.test(t) || /\b(anything else|sound good|does that work|would you like)\b/.test(lower)
  const hasSignoff = /\b(thanks|thank you|cheers|talk soon|have a great|have a good|take care)\b/.test(lower)
  if (hasQuestion || hasSignoff) return t
  // Default friendly follow-up prompt
  return t.endsWith('.') ? `${t} Anything else you’d like me to tackle?` : `${t} — Anything else you’d like me to tackle?`
}
