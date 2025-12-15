import { type AnkrStep1Response } from '@/lib/ankr/config'

function fmtKV(k: string, v: string) {
  return `  - ${k}: ${v}`
}

export async function runStep2(input: AnkrStep1Response) {
  const { intent, messageAnalysis: ma, threadId, telemetry } = input
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
}

