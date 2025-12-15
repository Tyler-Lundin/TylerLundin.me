import type { SupabaseClient } from '@supabase/supabase-js'
import { getZ } from '@/lib/ankr/zod-adapter'
import { ACTION_SPECS, getExecSchema } from '@/lib/ankr/actions/spec'

export type ActionStatus = 'requested' | 'acknowledged' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export type ActionRow = {
  id: string
  thread_id: string | null
  source_message_id: string | null
  requested_by: 'assistant' | 'user' | 'system'
  action_name: string
  params: any
  status: ActionStatus
  status_info: any
  correlation_id: string | null
  acknowledged_by: string | null
  executed_by: string | null
  executed_at: string | null
  created_at: string
  updated_at: string
}

export type ExecResult = { status: ActionStatus; status_info?: any }

export type ActionHandler = (supabase: SupabaseClient<any, any, any>, row: ActionRow) => Promise<ExecResult>

// Helpers
function asObject(maybe: any): any {
  if (maybe == null) return {}
  if (typeof maybe === 'string') {
    try { return JSON.parse(maybe) } catch { return {} }
  }
  if (typeof maybe === 'object') return maybe
  return {}
}

function slugify(s: string, max = 48) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, max) || `topic-${Date.now()}`
}

function deriveTags(title: string, analysis: any): string[] {
  const out: string[] = []
  const push = (v?: string) => {
    const s = (v || '').toLowerCase().trim()
    if (!s) return
    if (/^[a-z0-9\- ]{2,}$/.test(s)) {
      // split by spaces and hyphens, keep words >= 3 chars
      s.split(/[\s\-]+/).forEach((w) => {
        const ww = w.trim()
        if (ww.length >= 3) out.push(ww)
      })
    } else if (s.length >= 3) {
      out.push(s)
    }
  }
  // from analysis if provided
  const a = analysis || {}
  if (Array.isArray(a.keywords)) a.keywords.forEach((k: any) => push(String(k)))
  if (Array.isArray(a.relatedTo)) a.relatedTo.forEach((k: any) => push(String(k)))
  if (typeof a.goal === 'string') push(a.goal)
  // from title
  push(title)
  // normalize, dedupe, cap
  const stop = new Set(['the','a','an','of','and','for','with','this','that','what','where','when','how','on','in','to','we','is','it','you','are'])
  const uniq: string[] = []
  const seen = new Set<string>()
  for (const t of out) {
    if (stop.has(t)) continue
    if (!seen.has(t)) { seen.add(t); uniq.push(t) }
    if (uniq.length >= 12) break
  }
  return uniq
}

// Lightweight token + quote helpers (mirrors chat pipeline)
function extractTokens(text: string): string[] {
  const stop = new Set(['the','a','an','of','and','for','with','this','that','what','where','when','how','on','in','to','we','is','it','you','are'])
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && w.length >= 3 && !stop.has(w))
}

function extractQuoted(text: string): string | null {
  const m = String(text || '').match(/["'“”‘’]([^"“”'‘’]+)["'“”‘’]/)
  return m ? m[1].trim() : null
}

async function validateActionParams(name: string, params: any) {
  const schema = await getExecSchema(name)
  const res = schema.safeParse ? schema.safeParse(params) : { success: true, data: params }
  if (!res.success) throw new Error(`INVALID_PARAMS: ${res.error?.message || 'bad args'}`)
}

// Action Handlers
const createTopic: ActionHandler = async (supabase, row) => {
  const p = asObject(row.params)
  const analysis = asObject(p.analysis)
  const title: string = (p.title && String(p.title)) || (analysis.goal && String(analysis.goal)) || 'New Topic'
  // Peek at the source user message to capture any quoted label like "Ankr"
  let sourceText: string | null = null
  if (row.source_message_id) {
    try {
      const { data: src } = await supabase.from('ankr_messages').select('content').eq('id', row.source_message_id).single()
      if (src && typeof src.content === 'string') sourceText = src.content
    } catch {}
  }
  const quoted = sourceText ? extractQuoted(sourceText) : null
  // Prefer a slug derived from a quoted phrase if present; otherwise from title
  const slug = (p.slug && String(p.slug)) || (quoted ? slugify(quoted) : slugify(title))
  const kind = (p.kind && String(p.kind)) || 'project'
  const tagsIn: string[] = Array.isArray(p.tags) ? p.tags.map((t: any) => String(t).toLowerCase().trim()).filter(Boolean) : []
  const quotedTags: string[] = quoted ? [quoted.toLowerCase().trim(), ...extractTokens(quoted)] : []
  const tags = Array.from(new Set([ ...deriveTags(title, analysis), ...quotedTags, ...tagsIn ])).slice(0, 16)
  const description: string | null = (typeof p.description === 'string' && p.description.trim()) ? String(p.description).trim() : (analysis.goal || null)
  // Upsert by slug to avoid duplicates
  const { data: existing } = await supabase.from('ankr_topics').select('*').eq('slug', slug).single()
  if (existing) {
    return { status: 'succeeded', status_info: { message: 'Topic exists', topicId: existing.id } }
  }
  const { data, error } = await supabase.from('ankr_topics').insert([{ slug, title, kind, description, tags }]).select('*').single()
  if (error) return { status: 'failed', status_info: { code: 'CREATE_TOPIC_FAILED', message: error.message } }
  // Optionally attach to thread
  if (row.thread_id && data?.id) {
    await supabase.from('ankr_thread_topics').upsert([{ thread_id: row.thread_id, topic_id: data.id, pinned: true }], { onConflict: 'thread_id,topic_id' })
  }
  return { status: 'succeeded', status_info: { topicId: data?.id, slug } }
}

const attachTopicToThread: ActionHandler = async (supabase, row) => {
  const p = asObject(row.params)
  let topicId: string | undefined = p.topicId
  const pinned = p.pinned === false ? false : true
  const debug: any = { input: { topicId: p.topicId, topicSlug: p.topicSlug || p.slug, topicTitle: p.topicTitle || p.title, pinned } }
  if (!row.thread_id) return { status: 'failed', status_info: { code: 'BAD_PARAMS', message: 'thread_id required', debug } }
  // Try to resolve topic by slug/title if id not provided
  if (!topicId) {
    try {
      let q = supabase.from('ankr_topics').select('id,slug,title').limit(1)
      if (p.topicSlug || p.slug) q = q.eq('slug', String(p.topicSlug || p.slug))
      else if (p.topicTitle || p.title) q = q.ilike('title', String(p.topicTitle || p.title))
      const { data } = await q
      if (data && data[0]?.id) topicId = data[0].id
    } catch (e: any) {
      debug.resolve_error = String(e?.message || e)
    }
  }
  if (!topicId) return { status: 'failed', status_info: { code: 'BAD_PARAMS', message: 'topicId required (or provide topicSlug/topicTitle)', debug } }
  // Idempotent: check if link exists
  try {
    const { data: existing } = await supabase
      .from('ankr_thread_topics')
      .select('thread_id,topic_id')
      .eq('thread_id', row.thread_id)
      .eq('topic_id', topicId)
      .limit(1)
    if (existing && existing.length > 0) return { status: 'succeeded', status_info: { topicId, message: 'Already attached' } }
  } catch {}
  const { error } = await supabase
    .from('ankr_thread_topics')
    .upsert([{ thread_id: row.thread_id, topic_id: topicId, pinned }], { onConflict: 'thread_id,topic_id' })
  if (error) return { status: 'failed', status_info: { code: 'ATTACH_FAILED', message: error.message, debug: { ...debug, thread_id: row.thread_id, topicId } } }
  return { status: 'succeeded', status_info: { topicId, pinned } }
}

const saveSnippet: ActionHandler = async (supabase, row) => {
  const p = asObject(row.params)
  const topicId: string | undefined = p.topicId
  const content: string | undefined = p.content || p.text
  const sourceRef: string | null = p.sourceRef || null
  if (!topicId || !content) return { status: 'failed', status_info: { code: 'BAD_PARAMS', message: 'topicId and content required' } }
  const { data, error } = await supabase.from('ankr_snippets').insert([{ topic_id: topicId, source_kind: 'note', source_ref: sourceRef, content, private: true }]).select('id').single()
  if (error) return { status: 'failed', status_info: { code: 'SNIPPET_SAVE_FAILED', message: error.message } }
  return { status: 'succeeded', status_info: { snippetId: data?.id } }
}

const draftNextSteps: ActionHandler = async (_supabase, row) => {
  const p = asObject(row.params)
  const analysis = asObject(p.analysis)
  const goal = String(analysis.goal || 'Define next steps')
  const steps = [
    `Clarify: ${goal.slice(0, 72)}…`,
    'Identify topics to pin (1–2).',
    'Capture 1–2 key snippets with sources.',
  ]
  return { status: 'succeeded', status_info: { steps } }
}

const saveNote: ActionHandler = async (supabase, row) => {
  const p = asObject(row.params)
  const type: string = p.noteType
  const content: string = p.content
  const topicId: string | undefined = p.topicId
  const sourceRef: string | null = p.sourceRef || null
  // Helper: detect generic content (e.g., "save key points")
  const isGeneric = (s: string) => {
    const t = String(s || '').toLowerCase().trim()
    if (!t) return true
    if (t.length < 24) return true
    if (/^save\s+(those\s+)?key\s+points/.test(t)) return true
    if (/^save\s+(the\s+)?summary/.test(t)) return true
    return false
  }
  // Helper: extract key points from an assistant message
  const extractKeyPoints = (text: string): string[] => {
    const lines = String(text || '').split(/\r?\n/)
    const bullets: string[] = []
    for (let raw of lines) {
      const l = raw.trim()
      // match -, •, * or numbered lists
      const m = l.match(/^(?:[-*•]\s+|\d+\.\s+)(.+)$/)
      if (m && m[1]) {
        const cleaned = m[1].trim().replace(/\s+/g, ' ')
        if (cleaned.length >= 6) bullets.push(cleaned)
      }
    }
    // fallback: split into sentences and take 3–6
    if (bullets.length === 0) {
      const sentences = String(text || '')
        .replace(/\s+/g, ' ')
        .split(/(?<=[.!?])\s+(?=[A-Z])/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 12)
      return sentences.slice(0, 6)
    }
    return bullets.slice(0, 10)
  }
  // If content is generic, derive key points from the source assistant message or recent thread assistant message
  if (!content || isGeneric(content)) {
    let baseText: string | null = null
    if (row.source_message_id) {
      try {
        const { data: src } = await supabase.from('ankr_messages').select('role,content').eq('id', row.source_message_id).single()
        if (src && typeof src.content === 'string' && (src.role === 'assistant' || src.role === 'system')) baseText = src.content
      } catch {}
    }
    if (!baseText && row.thread_id) {
      try {
        const { data: recent } = await supabase
          .from('ankr_messages')
          .select('role,content,created_at')
          .eq('thread_id', row.thread_id)
          .order('created_at', { ascending: false })
          .limit(6)
        const asst = (recent || []).find((m: any) => m.role === 'assistant')
        if (asst && typeof asst.content === 'string') baseText = asst.content
      } catch {}
    }
    const points = baseText ? extractKeyPoints(baseText) : []
    if (points.length > 0) {
      const rows = points.map((pt) => ({
        thread_id: row.thread_id ?? null,
        topic_id: topicId ?? null,
        type: type || 'thought',
        content: pt,
        source_ref: sourceRef || (row.source_message_id ? `message:${row.source_message_id}` : null),
      }))
      const { data, error } = await supabase.from('ankr_notes').insert(rows).select('id')
      if (error) return { status: 'failed', status_info: { code: 'NOTE_SAVE_FAILED', message: error.message } }
      const ids = Array.isArray(data) ? data.map((d: any) => d.id) : []
      return { status: 'succeeded', status_info: { noteIds: ids, count: ids.length } }
    }
    // Fall through to single generic note if we couldn't parse anything
  }
  // Single note insert (explicit content)
  const noteRow: any = { thread_id: row.thread_id ?? null, topic_id: topicId ?? null, type: type || 'thought', content, source_ref: sourceRef || (row.source_message_id ? `message:${row.source_message_id}` : null) }
  const { data, error } = await supabase.from('ankr_notes').insert([noteRow]).select('id').single()
  if (error) return { status: 'failed', status_info: { code: 'NOTE_SAVE_FAILED', message: error.message } }
  return { status: 'succeeded', status_info: { noteId: data?.id } }
}

// Registry mapping
const REGISTRY: Record<string, ActionHandler> = {
  CreateTopic: createTopic,
  AttachTopicToThread: attachTopicToThread,
  SaveNote: saveNote,
  SaveSnippet: saveSnippet,
  DraftNextSteps: draftNextSteps,
  // Stubs for future mapping
  UpdateProject: async () => ({ status: 'succeeded', status_info: { note: 'Not implemented; noop' } }),
  OpenPRDraft: async () => ({ status: 'succeeded', status_info: { note: 'Not implemented; noop' } }),
  CreateIssue: async () => ({ status: 'succeeded', status_info: { note: 'Not implemented; noop' } }),
  SearchRepo: async () => ({ status: 'succeeded', status_info: { note: 'Not implemented; noop' } }),
}

export function getActionHandler(name: string): ActionHandler | null {
  return REGISTRY[name] || null
}

export async function executeActionCall(
  supabase: SupabaseClient<any, any, any>,
  id: string,
  executedBy = 'dev',
  opts?: { force?: boolean }
): Promise<ActionRow> {
  // Load row
  const { data: row, error } = await supabase.from('ankr_action_calls').select('*').eq('id', id).single()
  if (error) throw new Error(`FETCH_FAILED: ${error.message}`)
  // If already terminal and not forcing, return as-is
  const terminal = new Set(['succeeded', 'failed', 'cancelled'])
  if (terminal.has(row.status) && !opts?.force) return row
  // Transition to running (force allows rerun from terminal states)
  const { error: runErr } = await supabase.from('ankr_action_calls').update({ status: 'running', executed_by: executedBy }).eq('id', id)
  if (runErr) throw new Error(`RUN_MARK_FAILED: ${runErr.message}`)
  // Execute
  const handler = getActionHandler(row.action_name)
  let result: ExecResult
  if (!handler) {
    result = { status: 'failed', status_info: { code: 'NO_HANDLER', message: `No handler for ${row.action_name}` } }
  } else {
    try {
      // Normalize + validate params per action-specific schema
      let params = asObject(row.params)
      params = normalizeParams(row.action_name, params)
      await validateActionParams(row.action_name, params)
      result = await handler(supabase, { ...row, params })
    } catch (e: any) {
      result = { status: 'failed', status_info: { code: 'HANDLER_ERROR', message: String(e?.message || e), action: row.action_name, params: row.params } }
    }
  }
  const patch: any = { status: result.status, status_info: result.status_info ?? null, executed_at: new Date().toISOString(), executed_by: executedBy }
  const { data: updated, error: updErr } = await supabase.from('ankr_action_calls').update(patch).eq('id', id).select('*').single()
  if (updErr) throw new Error(`UPDATE_FAILED: ${updErr.message}`)
  return updated as ActionRow
}

function normalizeParams(name: string, params: any) {
  const p = asObject(params)
  // Spec-driven normalization first
  const spec = ACTION_SPECS[name]
  if (spec?.normalize) try { return spec.normalize(p) } catch {}
  // Back-compat fallbacks
  if (name === 'SaveNote') {
    if (!p.noteType) p.noteType = 'goal'
    if (!p.content) {
      const goal = typeof p.analysis?.goal === 'string' ? p.analysis.goal : null
      p.content = goal || 'Captured goal'
    }
  }
  if (name === 'CreateTopic') {
    if (!p.title && typeof p.analysis?.goal === 'string') p.title = p.analysis.goal
  }
  return p
}
