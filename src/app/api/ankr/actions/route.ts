import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateActionCreateBody } from '@/lib/ankr/validation'

// Create one or more action call records requested by the assistant or user
// body: { threadId?, sourceMessageId?, requestedBy?: 'assistant'|'user'|'system', actions: { name: string, params?: any }[] }
export async function POST(req: NextRequest) {
  const DEBUG = (process.env.ANKR_DEBUG || '').toLowerCase() === 'true' || process.env.ANKR_DEBUG === '1'
  const requestId = `act_${Math.random().toString(36).slice(2, 10)}`
  const log = (line: string) => { if (DEBUG) console.log(line) }
  const t0 = Date.now()

  const supabase: any = await createServiceClient()
  const bodyRaw = await req.json().catch(() => null)
  if (!bodyRaw) return json({ error: { code: 'BAD_REQUEST', message: 'invalid json' } }, 400)
  let body: any
  try { body = await validateActionCreateBody(bodyRaw) } catch (e: any) { return json({ error: { code: 'BAD_REQUEST', message: e?.message || 'validation failed' } }, 400) }
  const requested_by = body.requestedBy && ['assistant','user','system'].includes(body.requestedBy) ? body.requestedBy : 'assistant'
  const rows = body.actions.map((a: any) => ({
    thread_id: body.threadId ?? null,
    source_message_id: body.sourceMessageId ?? null,
    requested_by,
    action_name: String(a?.name || '').trim().slice(0, 128),
    params: a?.params ?? {},
    status: 'requested',
  }))

  const invalid = rows.find((r: any) => !r.action_name)
  if (invalid) return json({ error: { code: 'BAD_REQUEST', message: 'each action requires a non-empty name' } }, 400)

  log(`▶︎ ANKR ACTIONS (${requestId})`)
  log(`  In.thread: ${rows[0].thread_id || '(none)'}  In.msg: ${rows[0].source_message_id || '(none)'}`)
  log(`  In.requestedBy: ${requested_by}`)
  log(`  In.actions: ${rows.map((r: any) => r.action_name).join(', ')}`)
  try {
    const debugParams = (body.actions || []).map((a: any) => ({ name: a?.name, params: a?.params ? JSON.stringify(a.params).slice(0, 240) : undefined }))
    log(`  In.params: ${debugParams.map((p: any) => `${p.name}:${p.params}`).join(' | ')}`)
  } catch {}

  try {
    const { data, error } = await supabase.from('ankr_action_calls').insert(rows).select('*')
    if (error) throw error
    log(`  Out.count: ${data?.length || 0}`)
    log(`  Time: ${Date.now() - t0}ms`)
    return json({ actions: data }, 200, { 'x-ankr-request-id': requestId })
  } catch (e: any) {
    const msg = e?.message || 'unknown error'
    log(`  ERROR: ${msg}`)
    log(`  Time: ${Date.now() - t0}ms`)
    return json({ error: { code: 'DB_INSERT_FAILED', message: String(msg) } }, 500, { 'x-ankr-request-id': requestId })
  }
}

function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
}
