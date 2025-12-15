import OpenAI from 'openai'
import { ANKR_CONFIG, ANKR_ACTIONS, ANKR_CATEGORIES, type AnkrAnalysis, type AnkrPlan, type ActionProposal } from './config'
import { getZ } from './zod-adapter'

const ENABLE = (process.env.ANKR_OPENAI_ENABLE || '').toLowerCase() === 'true' || process.env.ANKR_OPENAI_ENABLE === '1'

function getClient() {
  const key = process.env.OPENAI_API_KEY
  if (!ENABLE || !key) return null
  try {
    return new OpenAI({ apiKey: key })
  } catch {
    return null
  }
}

export async function analyzeMessage(input: {
  text: string
  categories: readonly string[]
  hints?: { pinnedTopics?: string[]; files?: string[] }
}): Promise<AnkrAnalysis> {
  const client = getClient()
  const z = await getZ()
  const AnalysisSchema = z.object({
    category: z.enum(ANKR_CATEGORIES as any),
    goal: z.string(),
    relatedTo: z.array(z.string()).optional(),
    confidence: z.number(),
    reasoning: z.string().optional(),
  })
  const system = `${ANKR_CONFIG.systemPrompts.analyze}\nAllowedCategories: ${input.categories.join(', ')}`
  const user = `Message:\n${input.text}\n\nPinnedTopics: ${(input.hints?.pinnedTopics || []).join(', ')}`

  if (!client) return localAnalyze(input)

  // helper to call model with JSON schema enforcement
  const call = async (): Promise<any> => {
    try {
      const res = await client.chat.completions.create({
        model: ANKR_CONFIG.models.analyze,
        messages: [ { role: 'system', content: system }, { role: 'user', content: user } ],
        temperature: 0,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'ankr_analyze_schema',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                category: { type: 'string', enum: Array.from(ANKR_CATEGORIES) },
                goal: { type: 'string' },
                relatedTo: { type: 'array', items: { type: 'string' }, minItems: 0, maxItems: 4 },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
                reasoning: { type: 'string' },
              },
              required: ['category', 'goal', 'confidence'],
            },
          },
        } as any,
      })
      const content = res.choices[0]?.message?.content?.trim() || '{}'
      return JSON.parse(content)
    } catch (e) {
      throw e
    }
  }

  try {
    let parsed = await call()
    // validate
    let out = AnalysisSchema.safeParse(parsed)
    if (!out.success) {
      // single repair retry
      const repairSystem = `${system}\nIMPORTANT: Your previous output did not validate. Repair and output a valid JSON per schema.`
      const res = await client.chat.completions.create({
        model: ANKR_CONFIG.models.analyze,
        messages: [ { role: 'system', content: repairSystem }, { role: 'user', content: user } ],
        temperature: 0,
        response_format: { type: 'json_object' },
      })
      const content = res.choices[0]?.message?.content?.trim() || '{}'
      parsed = JSON.parse(content)
      out = AnalysisSchema.safeParse(parsed)
      if (!out.success) throw new Error(out.error.message)
    }
    return sanitizeAnalysis(out.data, input.categories as any)
  } catch {
    return localAnalyze(input)
  }
}

export async function generatePlanResponse(input: {
  userMessage: string
  analysis: AnkrAnalysis
  snippetsPreview?: string
  actions: readonly string[]
  priorThreadsPreview?: string
  threadMessagesPreview?: string
  mode?: 'idea' | 'action'
}): Promise<AnkrPlan> {
  const client = getClient()
  const z = await getZ()
  const ActionProposalSchema = z.object({
    name: z.enum(ANKR_ACTIONS as any),
    args: z.object({}).optional(),
    confidence: z.number(),
  })
  const PlanSchema = z.object({
    response: z.string(),
    decision: z.string(),
    recommendedActions: z.array(ActionProposalSchema).optional(),
    analysisOverrides: z.object({}).optional(),
    citations: z.array(z.object({ id: z.string(), locator: z.string().optional() })).optional(),
    reasoning: z.string().optional(),
    bypassNextStep: z.boolean().optional(),
  })

  const systemPrompt = input.mode === 'idea' ? ANKR_CONFIG.systemPrompts.respondIdea : ANKR_CONFIG.systemPrompts.respond
  const system = `${systemPrompt}\nAvailableActions: ${input.actions.join(', ')}`
  const user = `OriginalMessage:\n${input.userMessage}\n\nAnalyzedMessage:\n${JSON.stringify(input.analysis)}\n\nRetrieval:\n${input.snippetsPreview || '(none)'}\n\nPriorThreads:\n${input.priorThreadsPreview || '(none)'}\n\nRecentThreadMessages:\n${input.threadMessagesPreview || '(none)'}\n`

  if (!client) return localPlan(input)
  // helper
  const call = async (): Promise<any> => {
    const res = await client.chat.completions.create({
      model: ANKR_CONFIG.models.respond,
      messages: [ { role: 'system', content: system }, { role: 'user', content: user } ],
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'ankr_plan_schema',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              response: { type: 'string' },
              decision: { type: 'string' },
              recommendedActions: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: true,
                  properties: {
                    name: { type: 'string', enum: Array.from(ANKR_ACTIONS) },
                    args: { type: 'object' },
                    confidence: { type: 'number', minimum: 0, maximum: 1 },
                  },
                  required: ['name', 'confidence'],
                },
              },
              analysisOverrides: { type: 'object' },
              citations: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, locator: { type: 'string' } }, required: ['id'] } },
              reasoning: { type: 'string' },
            },
            required: ['response','decision'],
          },
        },
      } as any,
    })
    const content = res.choices[0]?.message?.content?.trim() || '{}'
    return JSON.parse(content)
  }

  try {
    let parsed = await call()
    let out = PlanSchema.safeParse(parsed)
    if (!out.success) {
      const repairSystem = `${system}\nIMPORTANT: Your previous output did not validate. Repair and output a valid JSON per schema.`
      const res = await client.chat.completions.create({
        model: ANKR_CONFIG.models.respond,
        messages: [ { role: 'system', content: repairSystem }, { role: 'user', content: user } ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      })
      const content = res.choices[0]?.message?.content?.trim() || '{}'
      parsed = JSON.parse(content)
      out = PlanSchema.safeParse(parsed)
      if (!out.success) throw new Error(out.error.message)
    }
    return sanitizePlan(out.data)
  } catch {
    return localPlan(input)
  }
}

function sanitizeAnalysis(raw: any, allowedCats: readonly string[]): AnkrAnalysis {
  let category = typeof raw?.category === 'string' ? raw.category : 'Other'
  if (!allowedCats.includes(category)) category = 'Other'
  const goal = String(raw?.goal || '').split(/\s+/).slice(0, 12).join(' ').slice(0, 120)
  const related = Array.isArray(raw?.relatedTo) ? raw.relatedTo.slice(0, 4).map((x: any) => String(x).slice(0, 24)) : []
  let confidence = Number(raw?.confidence)
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) confidence = 0.5
  const reasoning = typeof raw?.reasoning === 'string' ? raw.reasoning.slice(0, 600) : undefined
  return { category, goal, relatedTo: related, confidence, reasoning }
}

function sanitizePlan(raw: any): AnkrPlan {
  const response = String(raw?.response || '').slice(0, 2000)
  const decision = String(raw?.decision || '').slice(0, 200)
  const recRaw = Array.isArray(raw?.recommendedActions) ? raw.recommendedActions : []
  const rec: ActionProposal[] = []
  for (const r of recRaw) {
    if (!r || typeof r !== 'object') continue
    const name = String(r.name || '')
    if (!(ANKR_ACTIONS as readonly string[]).includes(name)) continue
    let confidence = Number(r.confidence)
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) confidence = 0.5
    const args = (typeof r.args === 'object' && r.args != null && !Array.isArray(r.args)) ? r.args : {}
    rec.push({ name: name as any, args, confidence })
    if (rec.length >= 5) break
  }
  const analysisOverrides = (typeof raw?.analysisOverrides === 'object' && raw.analysisOverrides != null) ? raw.analysisOverrides : undefined
  const citations = Array.isArray(raw?.citations) ? raw.citations.filter((c: any) => c && typeof c.id === 'string').map((c: any) => ({ id: String(c.id), locator: c.locator ? String(c.locator) : undefined })) : undefined
  const reasoning = typeof raw?.reasoning === 'string' ? raw.reasoning : undefined
  const bypassNextStep = raw && typeof raw.bypassNextStep === 'boolean' ? !!raw.bypassNextStep : undefined
  return { response, decision, recommendedActions: rec, analysisOverrides, citations, reasoning, bypassNextStep }
}

// Fast-pass: infer intent flags (quick, low-cost). Returns a subset of allowed flags.
export async function flagIntents(input: { text: string; allowed: readonly string[]; contextHints?: string[] }): Promise<string[]> {
  const client = getClient()
  const z = await getZ()
  const FlagsSchema = z.object({ flags: z.array(z.string()).optional() })
  const system = `System: Classify the user's intent using ONLY the allowed flags. Output JSON with a 'flags' array of 0-5 items. Do not invent flags. Allowed: ${input.allowed.join(', ')}`
  const user = `Message:\n${input.text}\n\nContextHints:\n${(input.contextHints || []).join(', ') || '(none)'}`
  // Use model if available (cheap small model)
  if (client) {
    try {
      const res = await client.chat.completions.create({
        model: ANKR_CONFIG.models.analyze,
        messages: [ { role: 'system', content: system }, { role: 'user', content: user } ],
        temperature: 0,
        response_format: { type: 'json_object' } as any,
      })
      const content = res.choices[0]?.message?.content?.trim() || '{}'
      const parsed = JSON.parse(content)
      const out = FlagsSchema.safeParse(parsed)
      if (out.success && Array.isArray(out.data.flags)) {
        return out.data.flags.filter((f: any) => input.allowed.includes(String(f)))
      }
    } catch {}
  }
  // Local heuristic fallback
  const t = input.text.toLowerCase()
  const flags = new Set<string>()
  const add = (f: string) => { if (input.allowed.includes(f)) flags.add(f) }
  if (/\b(hello|hi|hey|what's up|how are you)\b/.test(t)) add('CHITCHAT')
  if (/\bclarif(y|ication)|what do you mean|could you explain\b/.test(t)) add('CLARIFY')
  // Only mark INFO_REQUEST for genuine information-seeking questions, not change requests framed as questions
  const isChangeAsk = /\b(change|update|edit|add|remove|set|adjust|modify|fix|make|create)\b/.test(t)
  const hasWhQuestion = /\b(what|why|how|where|which|when|who)\b/.test(t)
  const infoCue = /\b(explain|clarify|information|details)\b/.test(t)
  if ((hasWhQuestion || infoCue) && !isChangeAsk) add('INFO_REQUEST')
  if (/\bplan|roadmap|next steps|strategy\b/.test(t)) add('PLAN')
  if (/\bwrite|implement|build|generate code|snippet\b/.test(t)) add('CODE_WRITE')
  if (/\bbug|fix|debug|error|stack trace\b/.test(t)) add('CODE_DEBUG')
  if (/\bdesign|ux|ui|mockup|wireframe\b/.test(t)) add('DESIGN')
  if (/\bsql|schema|database|query|rls\b/.test(t)) add('DB')
  if (/\bdeploy|ci|pipeline|kubernetes|docker|env|ops\b/.test(t)) add('OPS')
  if (/\bseo|blog|post|content|copy\b/.test(t)) add('CONTENT')
  if (/\bsecurity|privacy|legal|license|unsafe|policy\b/.test(t)) add('SAFETY')
  if (/\bfrustrated|annoyed|stressed|overwhelmed\b/.test(t)) add('EMOTIONAL')
  if (/\bokay\?|sound good\?|what do you think\?|feedback\b/.test(t)) add('FEEDBACK')
  if (/\bconfused|don'?t understand|unclear\b/.test(t)) add('CONFUSION')
  if (/\burgent|asap|today|now|critical\b/.test(t)) add('CRITICAL')
  if (/\bdocs|documentation|guide|tutorial\b/.test(t)) add('DOCUMENTATION')
  if (/\bfeature request|could you add|it would be cool if\b/.test(t)) add('FEATURE_REQUEST')
  if (/\bhelp|assist|support\b/.test(t)) add('ASSISTANCE')
  if (/\breview|audit|analyze|look over\b/.test(t)) add('REVIEW')
  // small cap
  return Array.from(flags).slice(0, 5)
}

// Extract key subjects from a message. Returns up to N subjects with weights 0-1.
export async function extractSubjects(input: { text: string; max?: number; contextHints?: string[] }): Promise<Array<{ label: string; weight: number }>> {
  const client = getClient()
  const z = await getZ()
  const Schema = z.object({ subjects: z.array(z.object({ label: z.string(), weight: z.number() })).optional() })
  const max = Math.max(1, Math.min(6, input.max || 4))
  const system = `System: Extract SUBJECTS (entities + key concepts) from the user's message for retrieval/routing.

Return STRICT JSON only:
{ "subjects": [ { "label": string, "weight": number } ] }

Hard rules:
- subjects: 0..${max} items.
- label: 1–3 words, Title Case, letters/numbers/spaces only. No punctuation, no emojis.
- DO NOT copy long phrases from the message. Labels must be canonical concepts (e.g. "Auth Flow", "Pricing Page", "Ankr").
- Prefer: proper nouns, project names, features, components, files, endpoints, tools, data stores.
- Avoid generic verbs/command words and filler: "Let", "Let's", "Design", "Help", "Question", "Website" (unless paired, e.g. "Marketing Website").
- De-duplicate near-synonyms; keep the most specific label.
- weight: centrality to intent from 0.0 to 1.0. Sort by weight desc.
- If too vague, return { "subjects": [] }.

Output JSON only.`;

  const user = `Message:\n${input.text}\n\nContextHints:\n${(input.contextHints || []).join(', ') || '(none)'}\n\nRules:\n- Do not include generic filler words.\n- Prefer named entities, product or topic tags, and key nouns.\n- Weights reflect salience (0.4-0.95).`
  if (client) {
    try {
      const res = await client.chat.completions.create({
        model: ANKR_CONFIG.models.analyze,
        messages: [ { role: 'system', content: system }, { role: 'user', content: user } ],
        temperature: 0,
        response_format: { type: 'json_object' } as any,
      })
      const content = res.choices[0]?.message?.content?.trim() || '{}'
      const parsed = JSON.parse(content)
      const out = Schema.safeParse(parsed)
      if (out.success && Array.isArray(out.data.subjects)) {
        // sanitize
        const dedup = new Map<string, number>()
        for (const s of out.data.subjects) {
          const label = String(s.label || '').trim()
          if (!label) continue
          const w = Number(s.weight)
          const weight = Number.isFinite(w) ? Math.max(0, Math.min(1, w)) : 0.6
          dedup.set(label.toLowerCase(), Math.max(dedup.get(label.toLowerCase()) || 0, weight))
        }
        return Array.from(dedup.entries())
          .map(([k, w]) => ({ label: k, weight: w }))
          .sort((a, b) => b.weight - a.weight)
          .slice(0, max)
      }
    } catch {}
  }
  // Local heuristic fallback
  const text = String(input.text || '')
  const tokens = text
    .replace(/([#@][\w\-]+)/g, ' $1 ') // keep hashtags/handles as tokens
    .replace(/[^\p{L}\p{N}#@\s]/gu, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  const stop = new Set(['the','a','an','and','or','of','in','on','for','with','to','from','this','that','these','those','it','is','are','was','were','be','been','as','at','by','about','into','over','after','before','how','what','when','where','why','which','who','whom'])
  const counts = new Map<string, number>()
  for (const t of tokens) {
    if (stop.has(t)) continue
    if (t.length < 3 && !t.startsWith('#') && !t.startsWith('@')) continue
    counts.set(t, (counts.get(t) || 0) + 1)
  }
  // Prefer quoted phrase as a strong subject
  const quoted = text.match(/["'“”‘’]([^"“”'‘’]+)["'“”‘’]/)
  const subjects: Array<{ label: string; weight: number }> = []
  if (quoted && quoted[1]) subjects.push({ label: quoted[1].trim().toLowerCase(), weight: 0.9 })
  const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  for (const [tok, freq] of ranked) {
    if (subjects.find((s) => s.label === tok)) continue
    const weight = Math.min(0.95, 0.45 + Math.log2(1 + freq) * 0.2)
    subjects.push({ label: tok, weight })
    if (subjects.length >= max) break
  }
  return subjects.slice(0, max)
}

function localAnalyze(input: { text: string; categories: readonly string[]; hints?: { pinnedTopics?: string[]; files?: string[] } }): AnkrAnalysis {
  const t = input.text.toLowerCase()
  let category = 'Other'
  if (/bug|error|issue|stack|trace/.test(t)) category = 'BugOrIssue'
  else if (/seo|keyword|content|post|blog/.test(t)) category = 'ContentOrSEO'
  else if (/refactor|dx|developer experience|cleanup/.test(t)) category = 'RefactorOrDX'
  else if (/feature|idea|concept|experiment/.test(t)) category = 'FeatureIdea'
  else if (/plan|breakdown|tasks?|milestone/.test(t)) category = 'PlanningOrTaskBreakdown'
  else if (/project|client|deliverable|scope/.test(t)) category = 'ProjectUpdate'
  const goal = input.text.split('\n')[0]?.split(/\s+/).slice(0, 12).join(' ').slice(0, 120) || 'Clarify goal.'
  const related = (input.hints?.pinnedTopics || []).slice(0, 4).map((s) => s.slice(0, 24))
  return { category: category as any, goal, relatedTo: related, confidence: 0.5 }
}

function localPlan(input: { userMessage: string; analysis: AnkrAnalysis; snippetsPreview?: string; actions: readonly string[]; priorThreadsPreview?: string; threadMessagesPreview?: string; mode?: 'idea' | 'action' }): AnkrPlan {
  const proposals: ActionProposal[] = []
  const { category, goal } = input.analysis
  const safePush = (name: string, args: Record<string, any> = {}, confidence = 0.6) => {
    if ((ANKR_ACTIONS as readonly string[]).includes(name)) proposals.push({ name: name as any, args, confidence })
  }
  if (input.mode === 'idea') {
    // Brainstorming-oriented local fallback: concrete suggestions, no actions by default
    const ideas: string[] = []
    const base = goal || input.userMessage.split('\n')[0] || 'your aim'
    const seed = base.replace(/\.+$/, '')
    ideas.push(`Explore 2–3 user stories that demonstrate ${seed}.`)
    ideas.push(`List differentiators vs existing tools; decide 1 bold angle to test.`)
    ideas.push(`Sketch a quick UX flow (3–5 screens) showing the happy path.`)
    ideas.push(`Define a success metric you can measure within a week.`)
    ideas.push(`Draft a minimal prompt+context setup that would wow a first user.`)
    ideas.push(`Identify 1 risky assumption and a low-effort validation.`)
    const response = [`Here are specific ideas to push this forward:`, ...ideas.map((i) => `- ${i}`), `Would you like me to elaborate one into a mini spec?`].join('\n')
    return { response, decision: 'Brainstorming mode: ideate first.', recommendedActions: [] }
  }
  // Always capture user goal as a note
  safePush('SaveNote', { noteType: 'goal', content: input.userMessage.slice(0, 500) }, 0.9)
  // Suggest concrete forward motion by category
  if (category === 'FeatureIdea' || category === 'PlanningOrTaskBreakdown') {
    safePush('DraftNextSteps', { analysis: input.analysis }, 0.85)
  }
  if (category === 'ProjectUpdate') {
    const title = goal || 'Ankr Project'
    safePush('CreateTopic', { title }, 0.75)
  }
  if (category === 'BugOrIssue') {
    safePush('SearchRepo', {}, 0.75)
    safePush('CreateIssue', {}, 0.7)
  }
  if (proposals.length < 1) {
    // Fallback general action
    safePush('DraftNextSteps', { analysis: input.analysis }, 0.8)
  }

  const bullets = [
    `Capture your goal so we keep direction tight.`,
    `Draft a crisp next-steps list tailored to your aim.`,
    `Optionally create a topic to anchor future work.`,
  ]
  const response = [
    `Here’s a concrete way to move this forward:`,
    `- ${bullets[0]}`,
    `- ${bullets[1]}`,
    `- ${bullets[2]}`,
    `Shall I save your goal and draft next steps now?`,
  ].join('\n')
  const decision = `Recommend: save your goal now, then draft next steps.`
  return { response, decision, recommendedActions: proposals, bypassNextStep: false }
}
