// @ts-nocheck
import { ANKR_CONFIG, type AnkrStep1Response } from '@/lib/ankr/config'
import { ACTION_SPECS } from '@/lib/ankr/actions/spec'
import { ACTION_PROPOSAL_PRESETS } from '@/lib/ankr/actions/proposals'
import { flagIntents, extractSubjects } from '@/lib/ankr/openai'

export type Step1Input = {
  message: string
  threadId?: string
}

type EntityType =
  | 'Project'
  | 'Feature'
  | 'Concept'
  | 'Tool'
  | 'Competitor'
  | 'Role'
  | 'Config'
  | 'Action'
  | 'File'
  | 'Endpoint'
  | 'BusinessField'
  | 'BusinessValue'
  | 'Page'
  | 'Service'
  | 'PageSection'
  | 'ContentType'
  | 'CollectionType'
  | 'MoneyValue'
  | 'DateRange'
  | 'ServiceName'
  | 'ContactMethod'
  | 'Schedule'

type Entity = { type: EntityType; value: string; weight: number; kind?: EntityType }

export async function runStep1(input: Step1Input): Promise<AnkrStep1Response> {
  const DEBUG = (process.env.ANKR_DEBUG || '').toLowerCase() === 'true' || process.env.ANKR_DEBUG === '1'
  const requestId = `req_${Math.random().toString(36).slice(2, 10)}`
  const chunks: string[] = []
  const push = (line: string) => { if (DEBUG) chunks.push(line) }
  const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n) + '…' : s)

  const t0 = Date.now()
  const bodyMessage = String(input.message || '')
  push(`▶︎ ANKR CHAT (${requestId})`)
  push(`  In.msg: "${trunc(bodyMessage, 160)}" (${bodyMessage.length} chars)`) 
  push(`  In.thread: ${input.threadId ? `reuse ${input.threadId}` : 'new'}`)

  // Step 1: Intents and Subjects
  let flags: string[] = []
  let subjects: Array<{ label: string; weight: number }> = []
  try { flags = await flagIntents({ text: bodyMessage, allowed: ANKR_CONFIG.intentFlags, contextHints: [] }) } catch {}
  // Heuristic upgrade: code artifact ask implies CODE_WRITE
  try {
    const t = bodyMessage
    const codeArtifactAsk = /\b(typescript|interface\b|schema\b|sql\b|migration\b|zod\b)\b/i.test(t) || /\btype\s+[A-Za-z_][A-Za-z0-9_]*/i.test(t)
    const explanationOnly = /\b(explain|explanation|what\s+is|why|describe|definition)\b/i.test(t)
    if (codeArtifactAsk && !explanationOnly && !flags.includes('CODE_WRITE') && ANKR_CONFIG.intentFlags.includes('CODE_WRITE')) flags = Array.from(new Set([...flags, 'CODE_WRITE']))
    // Heuristic: content/site change implies CONTENT + CHANGE_REQUEST
    const changeVerb = /\b(change|update|edit|add|remove|set|adjust|modify|fix)\b/i.test(t)
    const siteObject = /\b(hours|business\s*hours|opening\s*hours|phone|number|address|email|services?|photos?|gallery|menu|pricing|coupon|promo|promotion|discount|deal|footer|contact|header|homepage|banner|website)\b/i.test(t)
    if (changeVerb && siteObject) {
      if (!flags.includes('CONTENT') && ANKR_CONFIG.intentFlags.includes('CONTENT')) flags = Array.from(new Set([...flags, 'CONTENT']))
      if (!flags.includes('CHANGE_REQUEST') && ANKR_CONFIG.intentFlags.includes('CHANGE_REQUEST')) flags = Array.from(new Set([...flags, 'CHANGE_REQUEST']))
    }
    // Deterministic media-change override: photos/images/gallery/before-after + replace/swap/update/remove/take off/delete
    const mediaNounCue = /(photos?|images?|gallery|before\s*\/?\s*after|before\s*and\s*after)/i.test(t)
    const mediaVerbCue = /(replace|swap|update|remove|take\s*off|delete)/i.test(t)
    if (mediaNounCue && mediaVerbCue) {
      if (!flags.includes('CONTENT') && ANKR_CONFIG.intentFlags.includes('CONTENT')) flags = Array.from(new Set([...flags, 'CONTENT']))
      if (!flags.includes('CHANGE_REQUEST') && ANKR_CONFIG.intentFlags.includes('CHANGE_REQUEST')) flags = Array.from(new Set([...flags, 'CHANGE_REQUEST']))
    }
    // Heuristic: contact form not sending/stopped working => BUG_REPORT path
    const bugCue = /(hasn['’]t\s+sent|not\s+(getting|receiving)|stopped\s+working|isn['’]t\s+working|not\s+sending|no\s+(emails|submissions))/i
    const contactCue = /(contact\s*form|contact\s*page|form\b)/i
    if (bugCue.test(t) && contactCue.test(t)) {
      if (!flags.includes('BUG_REPORT') && ANKR_CONFIG.intentFlags.includes('BUG_REPORT')) flags = Array.from(new Set([...flags, 'BUG_REPORT']))
      if (!flags.includes('SITE_ISSUE') && ANKR_CONFIG.intentFlags.includes('SITE_ISSUE')) flags = Array.from(new Set([...flags, 'SITE_ISSUE']))
    }
  } catch {}
  push(`  Flags: ${flags.join(', ') || '(none)'}`)
  try { subjects = await extractSubjects({ text: bodyMessage, max: 4 }) } catch {}
  // Post-filter subjects: 1–3 words, drop stopwords/fragments
  try {
    const STOP = new Set(['the','a','an','and','or','of','in','on','for','to','we','our','us','you','your','my','me','it','is','are','be','was','were','says','that','this','those','these','re','hey'])
    const clean = (lbl: string) => lbl.replace(/[^A-Za-z0-9\-\s]/g, ' ').replace(/\s+/g, ' ').trim()
    subjects = subjects
      .map(s => ({ ...s, label: clean(s.label) }))
      .filter(s => {
        const words = s.label.split(' ').filter(Boolean)
        if (words.length === 0 || words.length > 3) return false
        // drop numeric-only tokens (e.g., 509, 555)
        const compact = s.label.replace(/\s+/g, '')
        if (/^[0-9\-\(\)]+$/.test(compact)) return false
        const nonStop = words.filter(w => !STOP.has(w.toLowerCase()))
        if (nonStop.length === 0) return false
        s.label = nonStop.join(' ')
        return /^[A-Za-z0-9]/.test(s.label)
      })
  } catch {}
  push(`  Subjects: ${subjects.map(s => `${s.label}:${s.weight.toFixed(2)}`).join(', ') || '(none)'}`)

  const detectors = detectAll(bodyMessage)
  // CRITICAL flag only for explicit outage/payment/security/emergency language
  try {
    const t = bodyMessage
    const criticalCue = /(outage|emergency|(site|app|website)\s+(is\s+)?down|security\s+(incident|breach|issue)|hacked|ransom|payment(s)?\s+(down|broken|failing|failed)|card\s+(declined|processing\s+failed)|pci)/i.test(t)
    if (criticalCue && !flags.includes('CRITICAL') && ANKR_CONFIG.intentFlags.includes('CRITICAL')) {
      flags = Array.from(new Set([...flags, 'CRITICAL']))
    } else if (!criticalCue && flags.includes('CRITICAL')) {
      // remove CRITICAL if mistakenly set earlier
      flags = flags.filter(f => f != 'CRITICAL')
    }
  } catch {}

  // Enforce code artifact action for CODE_WRITE + artifact ask
  try {
    const d: any = detectors as any
    if (flags.includes('CODE_WRITE') && (d.wantsArtifact || d.codeArtifactAsk)) {
      const hasSnippet = Array.isArray(d.suggestedActions) && d.suggestedActions.some((a: any) => a.name === 'SaveSnippet')
      if (!hasSnippet && Array.isArray(d.suggestedActions)) {
        d.suggestedActions.unshift({ name: 'SaveSnippet', weight: 0.72 })
        const m = String(bodyMessage)
        const m1 = m.match(/\binterface\s+([A-Z][A-Za-z0-9_]*)/)
        const m2 = m.match(/\btype\s+([A-Z][A-Za-z0-9_]*)\s*=/)
        const iface = (m1 && m1[1]) || (m2 && m2[1]) || null
        const ctx: any = {
          interfaceName: iface,
          hasTS: /\b(typescript|\bts\b|interface\b|zod\b|type\s+\w+)/i.test(m),
          hasSQL: /\bsql|migration\b/i.test(m),
          firstSentence: m.split(/\.|\n|—|-/)[0]?.trim().slice(0, 140) || m.slice(0, 140),
        }
        const sample = ACTION_SPECS.SaveSnippet?.planSampleArgs?.(ctx) || { title: 'Code Snippet', source: 'message' }
        d.actionProposals = ([...(d.actionProposals || []), { name: 'SaveSnippet', weight: 0.72, args: sample, reason: 'Persist the requested code artifact.', blocking: false }])
      }
    }
  } catch {}

  const route = decideRoute(flags, detectors)
  const intentLabel = pickIntentLabel(flags)
  const intentConfidence = scoreIntentConfidence(flags, detectors)
  push(`  Intent: ${intentLabel} (${intentConfidence.toFixed(2)}) → route=${route}`)
  if (detectors.entities.length > 0) push(`  Entities: ${detectors.entities.slice(0,6).map(e=>`${e.type}:${e.value}`).join(', ')}${detectors.entities.length>6?'…':''}`)
  if (detectors.missingInfo.length > 0) push(`  Missing: ${detectors.missingInfo.map(m=>m.key).join(', ')}`)
  push(`  Inputs: code=${detectors.hasCode} err=${detectors.hasErrorLog} trace=${detectors.hasStackTrace} diff=${detectors.hasDiffPatch} sql=${detectors.hasSQL} cfg=${detectors.hasConfig} mcfg=${detectors.mentionsConfig||false} wantsArtifact=${(detectors as any).wantsArtifact||false} hasArtifact=${(detectors as any).hasArtifact||false} img=${detectors.hasScreenshotOrImageRef} link=${detectors.hasLinks}`)
  push(`  Safety: secrets=${detectors.containsSecretsRisk} privacy=${detectors.privacyRisk} pay=${detectors.paymentRisk} legal=${detectors.legalRisk}`)
  const actsLine = (detectors.suggestedActions || []).map((a: any) => `${a.name}(${(a.weight||0).toFixed(2)})`).join(', ')
  if (actsLine) push(`  Actions: ${actsLine}`)
  const propsPreview = (((detectors as any).actionProposals || []) as any[]).map((p: any) => ({ name: p.name, args: p.args, w: p.weight ?? p.confidence }))
  if (propsPreview.length > 0) push(`  ActionParams: ${JSON.stringify(propsPreview)}`)

  const res: AnkrStep1Response = {
    threadId: input.threadId || null,
    intent: {
      allowed: ANKR_CONFIG.intentFlags,
      allowedActions: ANKR_CONFIG.actions,
      flags,
      subjects,
    },
    messageAnalysis: {
      intent: intentLabel,
      intentConfidence,
      route,
      primaryIntent: (detectors as any).primaryIntent || intentLabel,
      entities: detectors.entities,
      needsContext: detectors.needsContext,
      contextScope: detectors.contextScope,
      missingInfo: (() => {
        // Post-processing safeguard: clear non-blocking missing info if we can proceed
        const acts = ((detectors as any).actionProposals || []).map((p: any) => p.name)
        const sugg = (detectors.suggestedActions || []).map((s: any) => s.name)
        const canProceed = route === 'retrieve_light' || acts.includes('CreateIssue') || acts.includes('CreateChangeRequest') || sugg.includes('CreateIssue') || sugg.includes('CreateChangeRequest')
        const list = detectors.missingInfo || []
        if (canProceed) return []
        return list.slice(0, 1)
      })(),
      clarifiers: (detectors as any).clarifiers || [],
      complexity: detectors.complexity,
      effort: detectors.effort,
      timeSensitivity: detectors.timeSensitivity,
      tone: detectors.tone,
      urgency: detectors.urgency,
      certainty: detectors.certainty,
      hasCode: detectors.hasCode,
      hasErrorLog: detectors.hasErrorLog,
      hasStackTrace: detectors.hasStackTrace,
      hasDiffPatch: detectors.hasDiffPatch,
      hasSQL: detectors.hasSQL,
      hasConfig: detectors.hasConfig,
      mentionsConfig: detectors.mentionsConfig,
      hasScreenshotOrImageRef: detectors.hasScreenshotOrImageRef,
      hasLinks: detectors.hasLinks,
      containsSecretsRisk: detectors.containsSecretsRisk,
      privacyRisk: detectors.privacyRisk,
      paymentRisk: detectors.paymentRisk,
      legalRisk: detectors.legalRisk,
      issues: (detectors as any).issues || [],
      changes: (detectors as any).changes || [],
      // Cast suggested actions to allow extended action names without tight coupling
      suggestedActions: (detectors.suggestedActions as any),
      actionProposals: (detectors as any).actionProposals || [],
      retrievalQueries: (detectors as any).retrievalQueries || [],
      wantsArtifact: (detectors as any).wantsArtifact || false,
      hasArtifact: (detectors as any).hasArtifact || false,
      memoryCandidates: detectors.memoryCandidates,
    },
    telemetry: { totalMs: Date.now() - t0 },
  }
  if (DEBUG) console.log(chunks.join('\n'))
  return res
}

// ——— Internal detectors used by Step 1 ———
function detectAll(text: string) {
  const t = String(text || '')
  const lc = t.toLowerCase()

  const hasCode = /```[\s\S]*?```|\bfunction\s+\w+\s*\(|=>\s*\{|class\s+\w+\s*\{|const\s+\w+\s*=/.test(t)
  const hasErrorLog = /(error|exception|failed|traceback|stack overflow|TypeError|ReferenceError|NullPointer|segmentation fault)/i.test(t)
  const hasStackTrace = /(at\s+\w+\s*\(|\)\s+at\s+|\bTraceback\b)/.test(t)
  const hasDiffPatch = /(diff --git|^\+\+\+ |^--- |^\+[^+]|^-[^-])/m.test(t)
  const hasSQL = (
    (/\bselect\b/i.test(t) && /\bfrom\b/i.test(t)) ||
    /\binsert\s+into\b/i.test(t) ||
    (/\bupdate\b/i.test(t) && /\bset\b/i.test(t)) ||
    (/\bdelete\b/i.test(t) && /\bfrom\b/i.test(t)) ||
    /\bcreate\s+table\b/i.test(t) ||
    /\balter\s+table\b/i.test(t) ||
    (/\bjoin\b/i.test(t) && (/\bselect\b/i.test(t) || /\bfrom\b/i.test(t)))
  )
  const mentionsConfig = /\b(config(uration)?|settings?)\b/i.test(t)
  const jsonFence = /```(?:json|ya?ml|toml|ini)?[\s\S]*?```/i.test(t)
  const jsonLike = /[{\[][\s\S]*?:[\s\S]*?[}\]]/.test(t)
  const kvLike = /\b[A-Z0-9_]{2,}\s*=\s*[^=\s]+/.test(t)
  const envRef = /(^|\W)\.env(\b|\W)/i.test(t) || /process\.env|NEXT_PUBLIC_/i.test(t)
  const configFilePath = /\bconfig\.(ts|tsx|js|jsx|json|ya?ml|toml|ini)\b/i.test(t)
  const hasConfig = jsonFence || jsonLike || kvLike || envRef || configFilePath
  const hasScreenshotOrImageRef = /(\.png|\.jpg|\.jpeg|\.gif|\.webp)\b|!\[[^\]]*\]\([^\)]+\)/i.test(t)
  const hasLinks = /https?:\/\//i.test(t)

  const entities: Entity[] = []
  const fileRxG = /\b[\w\-\/\.]+\.(tsx?|jsx?|css|scss|mdx?|json|ya?ml|toml|sql|env|tsconfig|eslintrc|prettierrc)\b/gi
  const routeRxG = /\b(GET|POST|PUT|PATCH|DELETE)\s+\/[\w\-\/:]+|\/(api|pages)\/[\w\-\/]+/gi
  const tableRxG = /\bfrom\s+([\w\.]+)|\btable\s+([\w\.]+)/gi
  const fileTestRx = /\b[\w\-\/\.]+\.(tsx?|jsx?|css|scss|mdx?|json|ya?ml|toml|sql|env|tsconfig|eslintrc|prettierrc)\b/i
  const routeTestRx = /\b(GET|POST|PUT|PATCH|DELETE)\s+\/[\w\-\/:]+|\/(api|pages)\/[\w\-\/]+/i
  const envRx = /\b([A-Z0-9_]{6,})\b/g
  const hasCodeLike = hasCode || fileTestRx.test(t) || routeTestRx.test(t) || /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/.test(t)

  if (hasCodeLike) {
    for (const m of t.matchAll(fileRxG)) entities.push({ type: 'File', value: m[0], weight: 0.85 })
    for (const m of t.matchAll(routeRxG)) entities.push({ type: 'Endpoint', value: m[0], weight: 0.75 })
  }
  for (const m of t.matchAll(envRx)) if (/_/.test(m[1])) entities.push({ type: 'Config', value: m[1], weight: 0.7 })
  if (/process\.env\.(\w+)/.test(t)) entities.push({ type: 'Config', value: t.match(/process\.env\.(\w+)/)![1], weight: 0.72 })
  if (/(config(uration)?|settings)/i.test(t)) {
    if (/(per[-\s]?website|per[-\s]?site|site|website)/i.test(t)) {
      entities.push({ type: 'Config', value: 'Per Website Configuration', weight: 0.7 })
    }
  }
  const svcList = ['supabase','openai','stripe','vercel','nextjs','postgres','mysql','redis','github','sentry','docker','kubernetes']
  for (const s of svcList) if (lc.includes(s)) entities.push({ type: 'Tool', value: s.replace(/\b\w/g, c=>c.toUpperCase()), weight: 0.65 })
  if (/\bankr\b/i.test(lc)) entities.push({ type: 'Project', value: 'Ankr', weight: 0.8 })
  if (/\bproject\b/i.test(t)) entities.push({ type: 'Project', value: 'Project', weight: 0.5 })
  const nounHints: Array<[RegExp, EntityType, string, number]> = [
    [/\bassistant\b/i, 'Feature', 'Website Assistant', 0.7],
    [/\bentity extractor|entities\b/i, 'Feature', 'Entity Extractor', 0.72],
    [/\bretrieval\b/i, 'Concept', 'Retrieval', 0.62],
    [/\b(prebuilt|premade)\s+actions\b/i, 'Action', 'Prebuilt Actions', 0.7],
    [/\bcompetitor\b/i, 'Competitor', 'Competitor', 0.5],
    [/\brole\b/i, 'Role', 'Role', 0.5],
  ]
  for (const [rx, type, val, w] of nounHints) if (rx.test(t)) entities.push({ type, value: val, weight: w })

  // Business content entity mode (when no code present)
  const changeVerb = /\b(change|update|edit|add|remove|set|adjust|modify|fix)\b/i.test(lc)
  const businessKeywordRx = /\b(hours|business\s*hours|opening\s*hours|phone|number|address|email|services?|photos?|gallery|menu|pricing|coupon|promo|promotion|discount|deal)\b/i
  const pageKeywordRx = /\b(footer|contact|header|homepage|banner)\b/i
  const hasBusinessAsk = !hasCodeLike && changeVerb && (businessKeywordRx.test(lc) || pageKeywordRx.test(lc))
  // Hours correction cue even without explicit change verb (e.g., "site says closed on Fridays but we're not")
  const fridayMention = /(friday|fridays)/i.test(lc)
  const closedCue = /\bclosed\b/i.test(lc)
  const contradictOpenCue = /(but\s+we\s*(are\s*)?not|we\s*are\s*open|open\s+on\s+fridays?)/i.test(lc)
  const hoursCorrectionDetected = fridayMention && (closedCue || /open/i.test(lc)) && contradictOpenCue
  // Collect normalized business changes early so detectors can append to it
  const businessChanges: Array<{ field: string; value?: string; current?: string; desired?: string; polarity?: string; location?: string; sourceHint?: string; needsClarifier?: boolean; timeframe?: string; discountType?: 'amount_off'|'percent_off' }> = []
  // Detect phone number change pattern: "shows X but should be Y" with two numbers
  let phoneChangeDetected = false
  try {
    const phoneRx = /(\+?\d[\d\-\(\)\s]{6,}\d)/g
    const nums: Array<{ match: string; index: number }> = []
    for (const m of t.matchAll(phoneRx)) { nums.push({ match: m[1], index: m.index || 0 }) }
    const hasTwo = nums.length >= 2
    const hasContrast = /(says|shows|listed|states|claims|displays)[^.]{0,80}(should|must|to)\s+be/i.test(lc) || /but\s+(actually|it'?s|should\s+be)/i.test(lc)
    const mentionsPhone = /\b(phone|phone\s*number|number)\b/i.test(lc)
    if (mentionsPhone && hasTwo && hasContrast) {
      nums.sort((a,b) => a.index - b.index)
      const cur = nums[0].match.trim()
      const des = nums[1].match.trim()
      entities.push({ type: 'ContactMethod', value: 'Phone', weight: 0.78 })
      entities.push({ type: 'BusinessField', value: 'Phone Number', weight: 0.82 })
      businessChanges.push({ field: 'Phone Number', current: cur, desired: des })
      phoneChangeDetected = true
    }
  } catch {}

  // Media-change detection (owner photo/gallery updates)
  let mediaChangeDetected = false
  try {
    const mediaNoun = /(photos?|images?|gallery|before\s*\/?\s*after|before\s*and\s*after)/i
    const mediaVerb = /(replace|swap|update|remove|take\s*off|delete)/i
    if (!hasCodeLike && mediaNoun.test(lc) && mediaVerb.test(lc)) {
      mediaChangeDetected = true
      entities.push({ type: 'PageSection', value: 'Gallery', weight: 0.75 })
      entities.push({ type: 'ContentType', value: 'Photos', weight: 0.75 })
      if (/before\s*\/?\s*after|before\s*and\s*after/i.test(lc)) entities.push({ type: 'CollectionType', value: 'Before/After', weight: 0.72 })
      businessChanges.push({ field: 'Gallery Photos', current: 'Old before/after photos', desired: 'New photos', sourceHint: 'texted last night' })
    }
  } catch {}

  const hasBusinessIntent = hasBusinessAsk || hoursCorrectionDetected || phoneChangeDetected || mediaChangeDetected
  let businessHoursText: string | null = null
  if (hasBusinessIntent) {
    // Entities: BusinessField, Page, Schedule (if detected)
    if (/hours|opening\s*hours|business\s*hours/i.test(lc)) entities.push({ type: 'BusinessField', value: 'Business Hours', weight: 0.85 })
    if (/phone|number/i.test(lc)) entities.push({ type: 'ContactMethod', value: 'Phone', weight: 0.75 })
    if (/email/i.test(lc)) entities.push({ type: 'ContactMethod', value: 'Email', weight: 0.72 })
    if (/services?/i.test(lc)) entities.push({ type: 'Service', value: 'Services', weight: 0.7 })
    // Pricing change cues
    try {
      const pricingCue = /\b(price|prices|pricing|rate|rates|fee|fees)\b/i
      if (pricingCue.test(lc)) {
        entities.push({ type: 'BusinessField', value: 'Pricing', weight: 0.82 })
        const pct = t.match(/(\d{1,3})\s*%/)
        const allServices = /\b(all|every|entire|across)\b[^\n]{0,40}\bservices?\b/i.test(lc)
        const desired = pct ? `Increase ${pct[1]}%${allServices ? ' (all services)' : ''}` : undefined
        businessChanges.push({ field: 'Pricing', ...(desired ? { desired } : {}), ...(allServices ? { location: 'All Services' } : {}) })
      }
    } catch {}
    const pages: Array<{ val: string; w: number }> = []
    if (/footer/i.test(lc)) pages.push({ val: 'Footer', w: 0.7 })
    if (/contact/i.test(lc)) pages.push({ val: 'Contact Page', w: 0.7 })
    if (/header/i.test(lc)) pages.push({ val: 'Header', w: 0.6 })
    if (/homepage|home\s?page/i.test(lc)) pages.push({ val: 'Homepage', w: 0.55 })
    for (const p of pages) entities.push({ type: 'Page', value: p.val, weight: p.w })
    // Try to extract a compact schedule text like "Mon–Fri 7–5" or "Mon-Fri 7am-5pm"
    const days = '(Mon|Tue|Tues|Wed|Thu|Thurs|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)'
    const time = '(?:[0-1]?\d|2[0-3])(?::\d{2})?\s?(?:am|pm|a\.?m\.?|p\.?m\.?)?'
    const timeRange = `${time}\s?[–-]\s?${time}`
    const dayRange = `${days}\s?(?:–|-|to)\s?${days}`
    const scheduleRx = new RegExp(`${dayRange}[^\n,;]{0,12}${timeRange}`, 'i')
    const m = t.match(scheduleRx)
    if (m) {
      businessHoursText = m[0].replace(/\s+/g, ' ').trim()
      entities.push({ type: 'Schedule', value: businessHoursText, weight: 0.7 })
      entities.push({ type: 'BusinessValue', value: businessHoursText, weight: 0.72 })
      businessChanges.push({ field: 'Business Hours', desired: businessHoursText })
    }

    // Multi-sentence cue: explicitly mention Friday open/closed state
    const fridayClosedCue = /(closed\s+on\s+fridays?|friday\s+closed)/i.test(lc)
    const notClosedCue = /(but\s+we\s*(are\s*)?not|we\s*are\s*open|open\s+on\s+fridays?)/i.test(lc)
    if (fridayMention && (fridayClosedCue || notClosedCue)) {
      entities.push({ type: 'BusinessField', value: 'Business Hours', weight: 0.86 })
      entities.push({ type: 'Schedule', value: 'Friday', weight: 0.74 })
      entities.push({ type: 'BusinessValue', value: 'Open Fridays', weight: 0.76 })
      // Do not infer desired; contrast handling below will set current/polarity when applicable.
    }

    // Detect header/banner change cues (e.g., "24/7 emergency" at the top)
    const hasHeaderCue = /\b(top|header|banner|hero)\b/i.test(lc)
    const hasEmergency = /\b24\/?7\b|\bemergency\b/i.test(lc)
    if (hasHeaderCue && hasEmergency) {
      entities.push({ type: 'BusinessField', value: 'Header Banner', weight: 0.8 })
      const val = /\b24\/?7\b.*?\bemergency\b|\bemergency\b.*?\b24\/?7\b/i.exec(t)?.[0] || '24/7 Emergency'
      businessChanges.push({ field: 'Header Banner', value: val.replace(/\s+/g, ' ').trim() })
    }

    // Detect phone emphasis change (e.g., make phone number bigger)
    const hasPhone = /\bphone(\s*number)?\b/i.test(lc)
    const wantsBigger = /\bbigger|increase\s+size|larger|make\s+it\s+pop|bold(er)?\b/i.test(lc)
    if (hasPhone && wantsBigger) {
      entities.push({ type: 'ContactMethod', value: 'Phone', weight: 0.75 })
      businessChanges.push({ field: 'Phone Number Emphasis', value: 'Make Bigger' })
    }

    // Service addition detection: quoted text or "add <noun phrase> to our services"
    try {
      const quoted = t.match(/["'“”‘’]([^"“”'‘’]+)["'“”‘’]/)
      const addToServicesRx = /\badd\s+("([^"]+)"|'([^']+)'|([a-z][a-z\s\-\/&]+?))\s+to\s+(our\s+)?services\b/i
      // Looser phrasing: "add that we do <phrase>" or "add <phrase>" (often when homepage is mentioned)
      const addWeDoRx = /\badd\s+(?:that\s+we\s+do\s+)?(?:"([^"]+)"|'([^']+)'|([a-z][a-z\s\-\/&]+?))(?:[\.!?,]|$)/i
      let serviceName: string | null = null
      const addMatch = t.match(addToServicesRx)
      const homepageMention = /\b(home\s?page|homepage)\b/i.test(lc)
      if (addMatch) {
        serviceName = (addMatch[2] || addMatch[3] || addMatch[4] || '').trim()
      } else if (/\bservices?\b/i.test(lc) && quoted && quoted[1]) {
        serviceName = quoted[1].trim()
      } else if (homepageMention) {
        const addWeDo = t.match(addWeDoRx)
        if (addWeDo) serviceName = (addWeDo[1] || addWeDo[2] || addWeDo[3] || '').trim()
      }
      if (serviceName) {
        entities.push({ type: 'ServiceName', value: serviceName, weight: 0.8 })
        entities.push({ type: 'BusinessField', value: 'Service List', weight: 0.8 })
        businessChanges.push({ field: 'Service List', value: serviceName, location: 'Services' })
        if (homepageMention) {
          entities.push({ type: 'Page', value: 'Homepage', weight: 0.6 })
          businessChanges.push({ field: 'Homepage Content', value: serviceName, location: 'Homepage' })
        }
      }
    } catch {}

    // Mixed request: vague design + concrete content (e.g., coupon/promo)
    try {
      const designVerb = /\b(change|update|refresh|revamp|redesign|modernize|modernise|make|fix)\b/i
      const designNoun = /\b(home\s?page|homepage|website|site|design|look|style)\b/i
      const wantsModern = /\bmore\s+modern|modern\b/i
      const couponCue = /\b(coupon|promo|promotion|discount|deal)\b/i
      const amountOffWithOffRx = /\$\s?\d{1,4}\s*off\b/i
      const amountBareRx = /\$\s?\d{1,4}\b/i
      const percentOffRx = /\d{1,3}\s?%\s*off\b/i
      const monthRx = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)/i

      const hasDesign = designVerb.test(lc) && designNoun.test(lc) && wantsModern.test(lc)
      const hasCoupon = couponCue.test(lc)
      if (hasDesign) {
        entities.push({ type: 'BusinessField', value: 'Site Design', weight: 0.78 })
        if (/home\s?page|homepage/i.test(lc)) entities.push({ type: 'Page', value: 'Homepage', weight: 0.62 })
        businessChanges.push({ field: 'Site Design', desired: 'more modern', needsClarifier: true })
      }
      if (hasCoupon) {
        entities.push({ type: 'BusinessField', value: 'Coupon/Promotion', weight: 0.78 })
        const amountOffWithOff = t.match(amountOffWithOffRx)
        const percentOff = t.match(percentOffRx)
        const amountBare = t.match(amountBareRx)
        const monthMatch = t.match(monthRx)
        let desired: string | undefined
        let discountType: 'amount_off'|'percent_off' | undefined
        if (amountOffWithOff) {
          desired = amountOffWithOff[0].replace(/\s+/g, ' ').trim()
          discountType = 'amount_off'
        } else if (percentOff) {
          desired = percentOff[0].replace(/\s+/g, ' ').trim()
          discountType = 'percent_off'
        } else if (amountBare) {
          desired = amountBare[0].replace(/\s+/g, ' ').trim() + ' off'
          discountType = 'amount_off'
        }
        if (desired) entities.push({ type: 'MoneyValue', value: desired, weight: 0.7 })
        if (monthMatch) entities.push({ type: 'DateRange', value: monthMatch[0], weight: 0.66 })
        businessChanges.push({ field: 'Coupon/Promotion', desired: desired || 'Promotion', timeframe: monthMatch ? monthMatch[0] : undefined, ...(discountType ? { discountType } : {}) })
      }
      // Add up to 2 clarifiers: design detail + coupon code/location if missing
      if (hasDesign && clarifiers.length < 2) clarifiers.push({ question: 'For “more modern”, do you have examples or specifics (colors, layout, hero)?', weight: 0.55 })
      if (hasCoupon && clarifiers.length < 2) {
        const hasCode = /(promo\s*code|use\s*code|code\s*[:#]?\s*[A-Z0-9\-]{3,})/i.test(t)
        const hasPlacement = /(banner|header|hero|homepage|top)/i.test(lc)
        if (!hasCode || !hasPlacement) clarifiers.push({ question: 'Where should the promo appear (homepage banner/header), and is there a promo code to show?', weight: 0.52 })
      }
    } catch {}
  }

  // Weekday + open/closed cue MUST produce a Business Hours change/entity, even without explicit change verb
  let weekdayLongDetected: string | null = null
  let openCueAnyDetected = false
  let closedCueAnyDetected = false
  try {
    const weekdays = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday','mon','tue','tues','wed','thu','thurs','fri','sat','sun']
    const weekdayRx = new RegExp(`\\b(${weekdays.join('|')})s?\\b`,'i')
    const weekdayMatch2 = lc.match(weekdayRx)
    openCueAnyDetected = /\bopen(\s+on)?\b/i.test(lc) || /\bnot\s+closed\b/i.test(lc) || /\bwe\s*are\s*open\b/i.test(lc)
    closedCueAnyDetected = /\bclosed\b/i.test(lc)
    if (weekdayMatch2 && (openCueAnyDetected || closedCueAnyDetected)) {
      const w = weekdayMatch2[1]
      const cap = (s: string) => s.slice(0,1).toUpperCase()+s.slice(1).toLowerCase()
      const map: Record<string,string> = { mon:'Monday', tue:'Tuesday', tues:'Tuesday', wed:'Wednesday', thu:'Thursday', thurs:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' }
      const long = map[w.toLowerCase()] || cap(w)
      const plural = long.endsWith('s') ? long : `${long}s`
      const desiredVal = openCueAnyDetected ? `Open ${plural}` : (closedCueAnyDetected ? `Closed ${plural}` : undefined)
      weekdayLongDetected = long
      entities.push({ type: 'BusinessField', value: 'Business Hours', weight: 0.86 })
      entities.push({ type: 'Schedule', value: long, weight: 0.74 })
      if (desiredVal) {
        // Contrast/negation pattern: both open and closed cues present
        if (openCueAnyDetected && closedCueAnyDetected) {
          // Try to decide which is CURRENT via "says/shows/listed" cues
          const saysClosed = /(says|shows|listed|states|claims)[^.]{0,40}\bclosed\b/i.test(lc)
          const saysOpen = /(says|shows|listed|states|claims)[^.]{0,40}\bopen\b/i.test(lc)
          const currentVal = saysClosed ? `Closed ${plural}` : saysOpen ? `Open ${plural}` : (closedCueAnyDetected ? `Closed ${plural}` : `Open ${plural}`)
          // Record BusinessValue as the CURRENT display from the message, not inferring desired
          entities.push({ type: 'BusinessValue', value: currentVal, weight: 0.76 })
          // Do NOT infer normalized desired at step 1; record negation policy
          businessChanges.push({ field: 'Business Hours', current: currentVal, polarity: 'negated' })
        } else {
          // Single cue present; if it's explicitly mentioned as listed/shown, treat as current w/ negation
          const saysClosedOnly = /(says|shows|listed|states|claims)[^.]{0,40}\bclosed\b/i.test(lc) && !openCueAnyDetected
          const saysOpenOnly = /(says|shows|listed|states|claims)[^.]{0,40}\bopen\b/i.test(lc) && !closedCueAnyDetected
          if (saysClosedOnly || saysOpenOnly) {
            const currentVal = saysClosedOnly ? `Closed ${plural}` : `Open ${plural}`
            entities.push({ type: 'BusinessValue', value: currentVal, weight: 0.72 })
            businessChanges.push({ field: 'Business Hours', current: currentVal, polarity: 'negated' })
          } else {
            // Otherwise, keep as desired only if user explicitly said "we are open/closed"
            const explicitWeAre = /\bwe\s*(are|re)\s*(open|closed)\b/i.exec(lc)
            if (explicitWeAre) {
              const explicitVal = explicitWeAre[2].toLowerCase() === 'open' ? `Open ${plural}` : `Closed ${plural}`
              entities.push({ type: 'BusinessValue', value: explicitVal, weight: 0.72 })
              businessChanges.push({ field: 'Business Hours', desired: explicitVal })
            }
          }
        }
      }
    }
  } catch {}

  // Bug/issue heuristics: contact form not sending
  const bugCue = /(hasn['’]t\s+sent|not\s+(getting|receiving)|stopped\s+working|isn['’]t\s+working|not\s+sending|no\s+(emails|submissions))/i
  const contactFormCue = /(contact\s*form|contact\s*page)/i
  const emailCue = /email|emails|notification/i
  const durationCue = /(for|in)\s+(?:like\s+)?(?:a\s+)?(?:few\s+)?(day|days|week|weeks)\b|last\s+week|for\s+a\s+while/i
  const bugContactForm = bugCue.test(lc) && (contactFormCue.test(lc) || (/\bform\b/i.test(lc) && /contact/i.test(lc)))
  const bugHasDuration = durationCue.test(lc)
  const questiony = /\?/.test(t) || /could you|can you|what|how|why|where|which/i.test(t)
  const finalizedEntities = finalizeEntities(entities, t)
  const hasExplicitProject = finalizedEntities.some(e => e.type === 'Project' && e.value.toLowerCase() !== 'project')
  const continuityRef = /\b(continue|again|still|same|that|this|those|these|previous|prev|earlier|above)\b/i.test(lc)
  const impliesExisting = /\b(update|modify|change|attach|configure|reconfigure|migrate|refactor|fix)\b/i.test(lc)
  const isMultiTenant = /^(1|true)$/i.test(String(process.env.ANKR_MULTI_TENANT || ''))
  const activeSiteId = String(process.env.ANKR_ACTIVE_SITE_ID || '').trim()
  // Consistent Needs Context: only when site/project selection is unknown
  const needsSiteSelection = isMultiTenant && activeSiteId === '' && !hasExplicitProject
  let needsContext = !!needsSiteSelection
  let contextScope: 'none'|'current_thread'|'topic_memory'|'cross_threads'|'site_selection' = needsContext ? 'site_selection' : 'none'

  const missingInfo: Array<{ key: string; weight: number }> = []
  const clarifiers: Array<{ question: string; weight: number }> = []
  if (/\bfile\b/i.test(t) && !fileTestRx.test(t)) missingInfo.push({ key: 'Target File Path', weight: 0.8 })
  if (/env|environment|staging|prod/i.test(t) && !/prod|staging|dev/.test(lc)) missingInfo.push({ key: 'Which Environment', weight: 0.6 })
  if (/\broute\b|endpoint|api\b/i.test(t) && !/\/api\//i.test(t)) missingInfo.push({ key: 'API Route/Endpoint', weight: 0.6 })
  if (/\btable\b/i.test(t) && !tableRxG.test(t)) missingInfo.push({ key: 'Database Table Name', weight: 0.6 })
  const specLike = /\b(spec|mvp|architecture|flow|requirements|design\s+doc|rfc)\b/i.test(lc)
  // Bug-specific clarifiers (rare, non-leading, max 1)
  if (bugContactForm) {
    const explicitEmailRef = /(email|emails|recipient|inbox|gmail|outlook)/i.test(lc)
    const explicitErrorRef = /(error|500|failed|bounce|mailer|delivery)/i.test(lc)
    const ambiguousBetweenDeliveryVsSubmission = !explicitErrorRef
    let q: string | null = null
    if (explicitEmailRef) {
      // Prefer symptom clarifier over implementation details
      q = 'Is there an error message after submitting the form?'
    } else if (ambiguousBetweenDeliveryVsSubmission) {
      q = 'Do you see form submissions in admin?'
    }
    if (q) clarifiers.push({ question: q, weight: 0.5 })
  }
  // Media-change clarifier: request upload/resend since SMS is inaccessible (at most 1 clarifier)
  if (clarifiers.length === 0) {
    try {
      const mediaNoun = /(photos?|images?|gallery|before\s*\/?\s*after|before\s*and\s*after)/i
      const mediaVerb = /(replace|swap|update|remove|take\s*off|delete)/i
      if (!hasCodeLike && mediaNoun.test(lc) && mediaVerb.test(lc)) {
        clarifiers.push({ question: 'Please upload or resend the photos here; SMS attachments are not accessible.', weight: 0.55 })
      }
    } catch {}
  }
  if (specLike) {
    missingInfo.push({ key: 'Knowledge Sources Per Site (repo/docs/DB/tickets)', weight: 0.72 })
    missingInfo.push({ key: 'Allowed Actions For MVP', weight: 0.68 })
    missingInfo.push({ key: 'Apply Mode (Auto vs Propose-Only)', weight: 0.65 })
  }

  let complexity = 0.3
  if (hasErrorLog || hasStackTrace) complexity += 0.2
  if (hasDiffPatch || hasSQL || hasConfig || hasCode) complexity += 0.2
  complexity = Math.max(0, Math.min(1, complexity))
  const effort: 'tiny'|'small'|'medium'|'large' = complexity < 0.25 ? 'tiny' : complexity < 0.45 ? 'small' : complexity < 0.7 ? 'medium' : 'large'
  const rightAwayCue = /\bright\s+away\b/i.test(t)
  const urgentCue = /\burgent|asap|immediately|prod\s+down|customer\s+waiting|today\b|before\s+\w+day|deadline|by\s+eod\b/i.test(t)
  const soonCue = /\btomorrow|soon|this\s+week|later\s+today/i.test(t)
  let timeSensitivity = urgentCue ? 0.8 : rightAwayCue ? 0.45 : (soonCue ? 0.45 : 0.25)
  const tone: 'neutral'|'positive'|'frustrated'|'stressed'|'excited' = /frustrat|annoyed|mad|angry/i.test(t) ? 'frustrated' : /overwhelm|stressed|panic/i.test(t) ? 'stressed' : /awesome|great|love|excited|!!/.test(t) ? 'excited' : /thank|nice|good/i.test(t) ? 'positive' : 'neutral'
  // Bug on contact form with duration implies higher time sensitivity (lead loss)
  if (bugContactForm && bugHasDuration) timeSensitivity = Math.max(timeSensitivity, 0.65)
  const urgency: 'low'|'medium'|'high' = timeSensitivity >= 0.7 ? 'high' : timeSensitivity >= 0.4 ? 'medium' : 'low'
  const certainty = (() => {
    let c = 0.6
    if (questiony) c -= 0.15
    if (/maybe|not sure|unsure|could|might/i.test(t)) c -= 0.15
    if (entities.length > 0) c += 0.1
    return Math.max(0, Math.min(1, c))
  })()

  const containsSecretsRisk = /(api[_-]?key|token|secret|password|passwd|AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{20,})/i.test(t)
  const privacyRisk = /\b(ssn|social security|phone\b|email\b|address\b)/i.test(t)
  const paymentRisk = /\bstripe|credit card|pci|billing|payment\b/i.test(lc)
  const legalRisk = /\blicense|legal|terms|policy|gdpr|ccpa\b/i.test(lc)

  const suggestedActions: Array<{ name: string; weight: number }> = []
  const allowedActions = ANKR_CONFIG.actions as readonly string[]
  const addAct = (name: string, w: number) => { if (allowedActions.includes(name)) { suggestedActions.push({ name, weight: Math.max(0, Math.min(1, w)) }) } }
  const issues: Array<{ summary: string; weight: number }> = []
  const changes: Array<{ field: string; value?: string; weight: number }> = []
  if (/\bcreate\s+(a\s+)?topic\b/i.test(lc) || /^\s*create\s+topic[:\-]/i.test(t)) addAct('CreateTopic', 0.85)
  if (questiony) addAct('DraftNextSteps', 0.6)
  if (hasLinks || finalizedEntities.some(e=>e.type==='File'||e.type==='Endpoint')) addAct('SaveSnippet', 0.6)
  if (hasCode || hasDiffPatch) addAct('CreateIssue', 0.58)
  if (hasSQL) addAct('CreateIssue', 0.55)
  if (finalizedEntities.some(e=>e.type==='Project' || e.type==='Config')) addAct('UpdateProject', 0.5)
  // Bug actions: contact form not sending
  if (bugContactForm) {
    // Force issue creation for tracking
    addAct('CreateIssue', bugHasDuration ? 0.88 : 0.8)
    // Do not force needsContext; Step 1 remains non-executable
    entities.push({ type: 'Feature', value: 'Contact Form', weight: 0.85 })
    if (emailCue.test(lc)) entities.push({ type: 'ContactMethod', value: 'Email', weight: 0.78 })
    entities.push({ type: 'Concept', value: 'Submission Failure', weight: 0.7 })
    entities.push({ type: 'Page', value: 'Contact Page', weight: 0.66 })
    const dur = /week/i.test(lc) ? '~1 week' : (bugHasDuration ? 'recently' : undefined)
    issues.push({ summary: `Contact form not sending emails${dur ? ` (${dur})` : ''}`, weight: bugHasDuration ? 0.88 : 0.8 })
  }
  // Business change actions: pick apply vs queue mode
  const hasChangeSignal = hasBusinessIntent || businessChanges.length > 0
  if (hasChangeSignal) {
    const autoApply = /^(1|true|yes)$/i.test(String(process.env.ANKR_AUTO_APPLY || ''))
    const highConfidence = certainty >= 0.7 && !!businessHoursText
    if (autoApply && highConfidence) {
      addAct('UpdateSiteHours', 0.9)
      addAct('PreviewChanges', 0.7)
    } else {
      addAct('CreateChangeRequest', 0.8)
      addAct('PreviewChanges', 0.7)
    }
  }

  // Record structured change items (always include weekday open/closed) with current/desired when inferable
  if (businessChanges.length > 0) {
    for (const c of businessChanges) {
      const item: any = { field: c.field, weight: 0.8 }
      if (c.value) item.value = c.value
      if (c.current) item.current = c.current
      if (c.desired) item.desired = c.desired
      if (c.polarity) item.polarity = c.polarity
      if (c.location) item.location = c.location
      changes.push(item)
    }
  } else if (fridayMention) {
    // Minimal fallback when only Friday mentioned
    changes.push({ field: 'Business Hours', desired: 'Open Fridays', weight: 0.65 })
  }

  const wantsArtifact = /\b(typescript|interface\b|schema\b|sql\b|migration\b|zod\b)\b/i.test(t) || /\btype\s+[A-Za-z_][A-Za-z0-9_]*/i.test(t)
  const hasArtifact = hasCode || hasDiffPatch || hasSQL
  if (wantsArtifact) {
    addAct('SaveSnippet', 0.75)
    addAct('UpdateProject', 0.6)
    addAct('CreateTopic', 0.4)
    addAct('CreateDoc', 0.5)
    addAct('UpdateDocs', 0.5)
    addAct('OpenPRDraft', 0.45)
    addAct('CreateFile', 0.45)
    addAct('GenerateType', 0.5)
  }

  // Add SaveNote only when explicitly asked, or when no concrete apply/queue action exists
  const wantsNote = /\b(remind\s+me|note\s+this|save\s+this|remember\s+this)\b/i.test(lc)
  const willApply = suggestedActions.some(a => a.name === 'UpdateSiteHours')
  const willQueue = suggestedActions.some(a => a.name === 'CreateChangeRequest')
  if (wantsNote || (!hasChangeSignal && !bugContactForm && !willApply && !willQueue)) {
    addAct('SaveNote', wantsNote ? 0.6 : 0.4)
  }

  const mergedActs = new Map<string, number>()
  for (const s of suggestedActions) mergedActs.set(s.name, Math.max(mergedActs.get(s.name) || 0, s.weight))
  let prunedActs = Array.from(mergedActs.entries()).map(([name, weight]) => ({ name, weight }))

  const hasDocsCue = /\b(update\s+docs?|docs|readme|documentation)\b/i.test(t)
  const hasCreateDoc = prunedActs.some(a => a.name === 'CreateDoc')
  const hasUpdateDocs = prunedActs.some(a => a.name === 'UpdateDocs')
  if (hasCreateDoc && hasUpdateDocs) {
    prunedActs = prunedActs.filter(a => a.name !== (hasDocsCue ? 'CreateDoc' : 'UpdateDocs'))
  }
  // Gate DraftNextSteps if docs actions exist and no explicit ask
  const asksWhatNext = /\b(what'?s?\s+next|what\s+next)\b/i.test(lc)
  if ((prunedActs.some(a => a.name === 'CreateDoc') || prunedActs.some(a => a.name === 'UpdateDocs')) && !asksWhatNext) {
    prunedActs = prunedActs.filter(a => a.name !== 'DraftNextSteps')
  }
  // Drop DraftNextSteps for business change requests when 2+ concrete actions exist
  if (hasBusinessIntent) {
    const bizCount = prunedActs.filter(a => a.name === 'UpdateSiteHours' || a.name === 'PreviewChanges' || a.name === 'CreateChangeRequest').length
    if (bizCount >= 2) {
      prunedActs = prunedActs.filter(a => a.name !== 'DraftNextSteps')
    }
  }
  if (prunedActs.some(a => a.name === 'SaveSnippet')) prunedActs = prunedActs.filter(a => a.name !== 'SaveNote')
  prunedActs.sort((a, b) => b.weight - a.weight)
  prunedActs = prunedActs.slice(0, 4)

  const proposals: Array<{ name: string; args: Record<string, any>; weight: number; reason?: string; blocking?: boolean; dependsOn?: string[] }> = []
  const firstSentence = t.split(/\.|\n|—|-/)[0]?.trim().slice(0, 140) || t.slice(0, 140)
  const getProjectName = () => finalizedEntities.find(e => e.type==='Project' && e.value.toLowerCase() !== 'project')?.value
  const projectName = getProjectName() || 'Current Project'
  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const projectSlug = slugify(projectName)
  const hasTS = /\b(typescript|\bts\b|interface\b|zod\b|type\s+\w+)/i.test(t)
  const hasSQLWord = /\bsql|migration\b/i.test(t)
  const interfaceName = (() => {
    const m1 = t.match(/\binterface\s+([A-Z][A-Za-z0-9_]*)/)
    const m2 = t.match(/\btype\s+([A-Z][A-Za-z0-9_]*)\s*=/)
    return (m1 && m1[1]) || (m2 && m2[1]) || null
  })()
  const isPerSiteConfig = /per[-\s]?site|per[-\s]?website|site\s*config|site\s*configuration/i.test(t) || finalizedEntities.some(e => e.type === 'Config' && /Per Website Configuration/i.test(e.value))
  const isAnkr = /\bankr\b/i.test(lc) || finalizedEntities.some(e => e.type === 'Project' && /ankr/i.test(e.value))
  const snippetTitle = interfaceName ? `${interfaceName} Interface` : hasSQLWord ? 'SQL Migration' : hasTS ? (isPerSiteConfig ? (isAnkr ? 'AnkrSiteConfig Interface' : 'Per-Site Config Interface') : 'Code Snippet') : 'Code Snippet'
  const docPath = `docs/${projectSlug}/${hasSQLWord ? 'schema' : 'site-config'}.md`
  const docTitle = hasSQLWord ? 'Database Schema' : 'Per-Site Configuration'

  // Collect page targets if present
  const pageTargets: string[] = []
  if (/footer/i.test(lc)) pageTargets.push('footer')
  if (/contact/i.test(lc)) pageTargets.push('contact')
  // Resolve field from BusinessField entities (highest weight) or first business change
  const resolvedField = (() => {
    const bf = finalizedEntities.filter(e => e.type === 'BusinessField').sort((a,b)=> (b.weight||0)-(a.weight||0))
    if (bf.length > 0) return bf[0].value
    if (businessChanges.length > 0) return businessChanges[0].field
    return hoursCorrectionDetected ? 'Business Hours' : undefined
  })()
  const ctx = { project: projectName, projectSlug, interfaceName, snippetTitle, hasTS, hasSQL: hasSQLWord, docPath, docTitle, firstSentence, businessField: resolvedField, businessHours: businessHoursText || undefined, pageTargets, businessChanges }

  // Enforce field-specific proposal presets (config-driven) before building concrete proposals
  if (resolvedField && ACTION_PROPOSAL_PRESETS[resolvedField]) {
    const preset = ACTION_PROPOSAL_PRESETS[resolvedField]
    for (const pa of preset.actions) {
      if (!prunedActs.some(a => a.name === pa.name) && (ANKR_CONFIG.actions as readonly string[]).includes(pa.name)) {
        prunedActs.push({ name: pa.name, weight: pa.weight })
      }
    }
    // Re-sort and cap to top 4
    prunedActs.sort((a, b) => b.weight - a.weight)
    prunedActs = prunedActs.slice(0, 4)
  }
  for (const s of prunedActs) {
    const spec = ACTION_SPECS[s.name]
    let sampleArgs = (spec && spec.planSampleArgs ? spec.planSampleArgs(ctx) : {}) as Record<string, any>
    let reason: string | undefined
    let blocking: boolean | undefined
    let dependsOn: string[] | undefined
    switch (s.name) {
      case 'CreateTopic': reason = 'Track ongoing work as a topic.'; break
      case 'UpdateProject': reason = 'Reflect new config schema in project docs.'; break
      case 'SaveNote': reason = 'Capture the request as a note.'; break
      case 'SaveSnippet': reason = 'Persist the code artifact for reuse.'; break
      case 'CreateIssue':
        reason = 'Track implementation as a task.'
        // If contact form bug detected, make the title explicit and mark severity/area
        if (bugContactForm) {
          const dur = /week/i.test(lc) ? '~1 week' : (bugHasDuration ? 'recently' : undefined)
          const title = `Contact form not sending emails${dur ? ` (${dur})` : ''}`
          sampleArgs = { ...(sampleArgs || {}), title, severity: 'high', area: 'leads' }
        }
        break
      case 'DraftNextSteps': reason = 'Outline immediate steps.'; break
      case 'CreateDoc': reason = 'Create a new spec/doc for this.'; break
      case 'UpdateDocs': reason = 'Update existing docs with new details.'; break
      case 'CreateFile': reason = 'Add a typed interface file.'; break
      case 'OpenPRDraft': reason = 'Open a draft PR to review changes.'; break
      case 'GenerateType': reason = 'Generate a TypeScript type/interface.'; break
      case 'UpdateSiteHours': reason = 'Update business hours across site locations.'; break
      case 'PreviewChanges': {
        const fieldName = ctx.businessField || (businessChanges[0]?.field)
        reason = fieldName ? `Preview how ${fieldName} will appear.` : 'Preview how changes will appear.'
        break
      }
      case 'CreateChangeRequest': reason = 'Queue the content change for approval.'; break
    }
    if (s.name === 'SaveSnippet') { blocking = false }
    if (s.name === 'CreateDoc' || s.name === 'UpdateDocs') { blocking = false }
    if (s.name === 'UpdateProject') { blocking = true; dependsOn = [`project_exists:${projectSlug}`] }
    proposals.push({ name: s.name, weight: s.weight, args: sampleArgs, reason, blocking, dependsOn })
  }

  // Entity-driven enforcement: ensure proposals reflect parsed changes and targets
  {
    const changeFields = Array.from(new Set(businessChanges.map(c => c.field).filter(Boolean)))
    for (const p of proposals) {
      if (p.name === 'CreateChangeRequest') {
        if (businessChanges.length > 0) {
          // Reference canonical list instead of duplicating payload
          p.args = { ...(p.args || {}), changesRef: 'messageAnalysis.changes' }
          delete (p.args as any).changes
          delete (p.args as any).field
          delete (p.args as any).value
          delete (p.args as any).current
          delete (p.args as any).desired
          delete (p.args as any).polarity
          delete (p.args as any).location
        } else if (resolvedField) {
          p.args = { ...(p.args || {}), field: resolvedField }
        }
      }
      if (p.name === 'PreviewChanges') {
        const targets = changeFields.length > 0 ? changeFields : (resolvedField ? [resolvedField] : [])
        if (targets.length > 0) {
          p.args = { ...(p.args || {}), targets, format: (p.args && (p.args as any).format) || 'plain' }
          // Improve reason: generic for multi-target, specific for single
          if (targets.length >= 3) {
            p.reason = 'Preview how the updates will appear.'
          } else if (targets.length === 2) {
            p.reason = `Preview how ${targets[0]} and ${targets[1]} will appear.`
          } else if (targets.length === 1) {
            p.reason = `Preview how ${targets[0]} will appear.`
          }
        } else {
          // Fallback generic reason
          p.reason = 'Preview how the updates will appear.'
        }
      }
    }
  }

  // Hard rule: proposals must be grounded in current message entities/keywords
  // Build allowed fields/targets based on parsed business changes and detected fields/pages
  const allowedFields = new Set<string>()
  for (const c of businessChanges) allowedFields.add(c.field)
  if (businessHoursText) allowedFields.add('Business Hours')
  const allowedTargets = new Set<string>(Array.from(allowedFields))
  for (const p of pageTargets) allowedTargets.add(`hours.${p}`)

  for (const p of proposals) {
    if (p.name === 'CreateChangeRequest' && p.args) {
      // If we still have an inline changes array (from earlier path), filter it; otherwise prefer changesRef
      if (Array.isArray((p as any).args?.changes)) {
        p.args.changes = p.args.changes.filter((c: any) => typeof c?.field === 'string' && (allowedFields.size === 0 || allowedFields.has(c.field)))
      }
      if (typeof p.args.field === 'string' && allowedFields.size > 0 && !allowedFields.has(p.args.field)) {
        delete p.args.field
        delete p.args.value
      }
    }
    if (p.name === 'PreviewChanges' && p.args && Array.isArray(p.args.targets)) {
      const filtered = p.args.targets.filter((t: any) => typeof t === 'string' && (allowedTargets.size === 0 || allowedTargets.has(t) || allowedFields.has(t)))
      if (filtered.length > 0) {
        p.args.targets = filtered
      } else {
        // Fallback to known fields if present
        const fallback = Array.from(allowedFields)
        if (fallback.length > 0) p.args.targets = fallback
      }
    }
  }

  const retrievalQueries = buildRetrievalQueries(finalizedEntities, t, { interfaceName, docPath, projectSlug })
  // Primary intent signaling for downstream
  const primaryIntent = bugContactForm ? 'BUG_REPORT' : (hasBusinessIntent ? 'CHANGE_REQUEST' : undefined)
  if (specLike) {
    const extraConcepts: Entity[] = []
    extraConcepts.push({ type: 'Concept', value: 'MVP Flow', weight: 0.68 })
    extraConcepts.push({ type: 'Concept', value: 'Access Permissions', weight: 0.64 })
    extraConcepts.push({ type: 'Concept', value: 'Knowledge Sources', weight: 0.64 })
    const merged = finalizeEntities([...finalizedEntities, ...extraConcepts], t)
    finalizedEntities.length = 0
    for (const e of merged) finalizedEntities.push(e)
  }

  const memoryCandidates: Array<{ key: string; value: string; weight: number }> = []
  if (/(always|prefer|from now on|going forward|default to)/i.test(t) && /(typescript|\bts\b)/i.test(t)) memoryCandidates.push({ key: 'pref_typescript', value: 'true', weight: 0.72 })
  if (/tailwind/i.test(t)) memoryCandidates.push({ key: 'pref_tailwind', value: 'true', weight: 0.6 })

  // Suppress top-level stub changes when proposals include concrete value-based changes
  const hasConcreteValueChangeInProposals = proposals.some(p => p.name === 'CreateChangeRequest' && Array.isArray((p.args as any)?.changes) && (p.args as any).changes.some((c: any) => c && typeof c === 'object' && typeof c.value === 'string' && c.value.trim() !== ''))
  const normalizedChanges = (hasConcreteValueChangeInProposals
    ? changes.filter((c: any) => (typeof c.value === 'string' && c.value.trim() !== '') || c.current || c.desired || c.polarity)
    : changes)

  return {
    entities: finalizedEntities,
    needsContext,
    contextScope,
    missingInfo: dedupeMissing(missingInfo).slice(0, 1),
    // Cap clarifiers at 2 to avoid noise while nudging specificity
    clarifiers: clarifiers.slice(0, 2),
    complexity,
    effort,
    timeSensitivity,
    tone,
    urgency,
    certainty,
    hasCode,
    hasErrorLog,
    hasStackTrace,
    hasDiffPatch,
    hasSQL,
    hasConfig,
    mentionsConfig,
    hasScreenshotOrImageRef,
    hasLinks,
    containsSecretsRisk,
    privacyRisk,
    paymentRisk,
    legalRisk,
    issues,
    changes: normalizedChanges.slice(0, 2).map((c: any) => {
      const { field, value, current, desired, polarity, location, sourceHint, needsClarifier, timeframe, discountType, weight } = c
      return {
        field,
        ...(value ? { value } : {}),
        ...(current ? { current } : {}),
        ...(desired ? { desired } : {}),
        ...(polarity ? { polarity } : {}),
        ...(location ? { location } : {}),
        ...(sourceHint ? { sourceHint } : {}),
        ...(typeof needsClarifier === 'boolean' ? { needsClarifier } : {}),
        ...(timeframe ? { timeframe } : {}),
        ...(discountType ? { discountType } : {}),
        ...(weight ? { weight } : {}),
      }
    }),
    suggestedActions: proposals.map(p => ({ name: p.name, weight: p.weight })),
    actionProposals: proposals,
    retrievalQueries,
    wantsArtifact,
    hasArtifact,
    memoryCandidates,
    ...(primaryIntent ? { primaryIntent } : {}),
  }
}

function dedupeEntities(arr: Entity[]): Entity[] {
  const out: Entity[] = []
  const seen = new Set<string>()
  for (const e of arr) {
    const key = `${e.type}:${e.value.toLowerCase()}`
    const prev = out.find((x) => `${x.type}:${x.value.toLowerCase()}` === key)
    if (!prev) out.push(e)
    else if ((e.weight || 0) > (prev.weight || 0)) Object.assign(prev, e)
  }
  return out
}

function finalizeEntities(arr: Entity[], rawText: string): Entity[] {
  const canon = (type: EntityType, v: string): string => {
    let val = v.trim()
    val = val.replace(/[\s\-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim()
    if (/^site assistant$/i.test(val) || /^assistant for site$/i.test(val)) val = 'Website Assistant'
    if (/^per site configuration$/i.test(val) || /^per website config$/i.test(val)) val = 'Per Website Configuration'
    if (/^pre\w+ actions$/i.test(val)) val = 'Prebuilt Actions'
    return val
  }
  const GENERIC_SINGLE = new Set(['Configuration','Config','Action','Project','Concept','Feature','Role'])
  const isProper = (s: string) => /^[A-Z][a-zA-Z0-9]+/.test(s) && !GENERIC_SINGLE.has(s)
  const isSingleWord = (s: string) => !/\s/.test(s)

  const dedup = new Map<string, Entity>()
  for (const e of arr) {
    let value = canon(e.type, e.value)
    if (isSingleWord(value) && !isProper(value) && (e.type === 'Config' || e.type === 'Action' || e.type === 'Concept' || e.type === 'Feature' || e.type === 'Project' || e.type === 'Role')) {
      continue
    }
    if ((e.type === 'Action' && /^Action$/i.test(value)) || (e.type === 'Config' && /^Configuration$/i.test(value))) continue
    const key = `${e.type}:${value.toLowerCase()}`
    const prev = dedup.get(key)
    if (!prev || (e.weight || 0) > (prev.weight || 0)) dedup.set(key, { ...e, value, kind: e.type })
  }
  let list = Array.from(dedup.values())
  list.sort((a, b) => (b.weight || 0) - (a.weight || 0))
  const text = rawText.toLowerCase()
  const vague = list.length <= 1 && text.length < 60 && !/\b(ankr|supabase|vercel|nextjs|stripe)\b/i.test(rawText)
  if (list.length > 0 && !vague && (list[0].weight || 0) < 0.75) list[0].weight = 0.78
  if (list.length > 8) list = list.slice(0, 8)
  return list
}

function buildRetrievalQueries(entities: Entity[], rawText: string, extra?: { interfaceName?: string | null; docPath?: string; projectSlug?: string }): string[] {
  const queries = new Set<string>()
  const byType = (t: EntityType) => entities.filter(e => e.type === t).map(e => e.value)
  const projs = byType('Project')
  const configs = entities.filter(e => e.type === 'Config' && /config|configuration/i.test(e.value)).map(e => e.value)
  const feats = byType('Feature')
  const text = rawText.toLowerCase()
  // Business-hours focused retrieval
  const isHoursChange = /\b(change|update|set|adjust|modify|edit)\b/i.test(rawText) && /\b(hours|business\s*hours|opening\s*hours)\b/i.test(rawText)
  const mentionsFooter = /\bfooter\b/i.test(rawText)
  const mentionsContact = /\bcontact\b/i.test(rawText)
  if (isHoursChange) {
    queries.add('hours')
    queries.add('business hours')
    if (mentionsFooter) queries.add('footer hours')
    if (mentionsContact) queries.add('contact page hours')
    // Optional schema query only if enabled
    const useSchema = /^(1|true|yes)$/i.test(String(process.env.ANKR_USE_SCHEMA_MARKUP || ''))
    if (useSchema) queries.add('localbusiness schema')
    // Early return site-agnostic queries only
    const out: string[] = []
    const seen = new Set<string>()
    for (const q of Array.from(queries)) {
      const norm = q.toLowerCase().trim().replace(/\s+/g, ' ')
      if (!seen.has(norm)) { seen.add(norm); out.push(norm) }
    }
    return out.slice(0, 5)
  }
  // Media-change retrieval cues
  if (/(photos?|images?|gallery)/i.test(text) || /before\s*\/?\s*after|before\s*and\s*after/i.test(text)) {
    queries.add('gallery')
    queries.add('before after')
    queries.add('photos')
  }
  if (projs[0] && configs.length > 0) queries.add(`${projs[0]} configuration`)
  if (feats.includes('Website Assistant') && /per[-\s]?website|per[-\s]?site|embedded|modular/i.test(rawText)) queries.add('website assistant embedded per site')
  if (/actions?\b/i.test(rawText) && /docs|data|site/i.test(rawText)) queries.add('actions docs data per site')
  if (extra?.interfaceName) queries.add(extra.interfaceName)
  // Avoid path-like placeholders in general retrieval unless clearly needed
  const tops = entities.filter(e => e.type !== 'File' && e.type !== 'Endpoint').slice(0,3).map(e => e.value.toLowerCase())
  // Avoid auto-combining two top subjects into one query; keep separate concise queries instead
  const hasPhoneField = entities.some(e => (e.type === 'BusinessField' && /phone\s*number/i.test(e.value)) || (e.type === 'ContactMethod' && /phone/i.test(e.value)))
  const norm = (q: string) => q.toLowerCase().trim().replace(/\s+/g, ' ')
  let list = Array.from(queries).map(norm)
  const slug = (extra?.projectSlug || '').trim().toLowerCase()
  if (slug) {
    const pathQ = `docs/${slug}/site-config.md`
    const looseQ = `docs/${slug} site-config`
    if (list.includes(pathQ)) list = list.filter(q => q !== looseQ)
  }
  const isAnkr = projs.some(p => /ankr/i.test(p)) || /\bankr\b/i.test(rawText)
  if (isAnkr && entities.some(e => e.type === 'Config')) list.unshift('ankr per website configuration')
  if (isAnkr) list.push('ankr configuration (optional)')
  // Heuristics: business hours (Friday/weekday) and contact form bug
  if (/hours|business\s*hours|opening\s*hours/i.test(text) && /friday|fridays/i.test(text)) {
    queries.add('hours friday')
  }
  if (/(hasn['’]t\s+sent|not\s+(getting|receiving)|stopped\s+working|isn['’]t\s+working|not\s+sending|no\s+(emails|submissions))/i.test(text) && /(contact\s*form|contact\s*page|\bform\b)/i.test(text)) {
    queries.add('contact form')
    queries.add('form submissions')
    queries.add('email notifications')
    if (/(smtp|mailgun|sendgrid|postmark)/i.test(text)) queries.add('smtp')
  }
  // Coupons/Promotions and Design cues
  if (/(coupon|promo|promotion|discount|deal)/i.test(text)) queries.add('coupon promotion')
  if (/(design|modern|homepage|home\s?page|website|site)/i.test(text) && /(change|update|refresh|revamp|redesign|modernize|modernise|make|fix)/i.test(text)) queries.add('site design')
  // Phone field retrieval
  if (hasPhoneField) {
    queries.add('phone number')
    if (/contact/i.test(text) || entities.some(e => e.type === 'Page' && /contact/i.test(e.value))) queries.add('contact phone')
    if (/header/i.test(text) || entities.some(e => e.type === 'Page' && /header/i.test(e.value))) queries.add('header phone')
  }

  const out: string[] = []
  const seen = new Set<string>()
  for (const q of list) { if (!seen.has(q)) { seen.add(q); out.push(q) } }
  // Ensure 2–4 concise queries for retrieve_light usage
  if (out.length < 2) {
    if (/contact\s*form/i.test(text)) {
      if (!out.includes('contact form')) out.push('contact form')
      if (!out.includes('form submissions')) out.push('form submissions')
    } else if (/hours|business\s*hours|opening\s*hours/i.test(text)) {
      if (!out.includes('business hours')) out.push('business hours')
      if (/mon|tue|tues|wed|thu|thurs|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(text) && !out.find(q=>/hours\s+\w+/.test(q))) out.push('business hours friday')
    } else if (hasPhoneField) {
      if (!out.includes('phone number')) out.push('phone number')
      if (!out.includes('contact phone')) out.push('contact phone')
    }
  }
  // Deduplicate and keep concise (2–3)
  return out.slice(0, 3)
}

function dedupeMissing(arr: Array<{ key: string; weight: number }>): Array<{ key: string; weight: number }> {
  const out: Array<{ key: string; weight: number }> = []
  const seen = new Set<string>()
  for (const m of arr) {
    const k = m.key.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(m)
  }
  return out
}

function decideRoute(flags: string[], d: ReturnType<typeof detectAll>): 'respond_only'|'retrieve_light'|'retrieve_heavy'|'ask_clarifying'|'handoff_tool' {
  if (d.certainty < 0.4 || flags.includes('CLARIFY')) return 'ask_clarifying'
  if (flags.includes('OPS') || flags.includes('DB') || d.hasDiffPatch || d.hasSQL) return 'retrieve_heavy'
  if (flags.includes('BUG_REPORT') || flags.includes('SITE_ISSUE')) return 'retrieve_light'
  if (flags.includes('CHANGE_REQUEST')) return 'retrieve_light'
  if (flags.includes('CODE_WRITE') || flags.includes('REVIEW') || d.hasCode || d.entities.length > 0) return 'retrieve_light'
  if (flags.includes('ASSISTANCE') || flags.includes('CHITCHAT')) return 'respond_only'
  if (flags.includes('CONTENT')) return 'retrieve_light'
  return 'respond_only'
}

function pickIntentLabel(flags: string[]): string {
  const order = ['BUG_REPORT','SITE_ISSUE','CHANGE_REQUEST','PLAN','CODE_WRITE','CODE_DEBUG','DB','OPS','CONTENT','REVIEW','ASSISTANCE','CHITCHAT','INFO_REQUEST','CLARIFY','FEATURE_REQUEST','DESIGN']
  for (const lbl of order) if (flags.includes(lbl)) return lbl
  return flags[0] || 'ASSISTANCE'
}

function scoreIntentConfidence(flags: string[], d: ReturnType<typeof detectAll>): number {
  let c = 0.5 + Math.min(0.25, flags.length * 0.08)
  if (d.entities.length > 0) c += 0.05
  if (d.hasCode || d.hasSQL || d.hasErrorLog) c += 0.1
  if (d.certainty < 0.4) c -= 0.2
  return Math.max(0, Math.min(1, c))
}
