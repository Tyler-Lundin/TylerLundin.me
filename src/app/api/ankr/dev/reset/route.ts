import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const ENABLED = (process.env.ANKR_DEV_ENABLE || '').toLowerCase() === 'true' || process.env.ANKR_DEV_ENABLE === '1'
  if (!ENABLED) return json({ error: { code: 'FORBIDDEN', message: 'Developer reset disabled' } }, 403)
  const body = await req.json().catch(() => ({} as any))
  if (!body || body.confirm !== 'RESET') return json({ error: { code: 'BAD_REQUEST', message: 'confirm must be "RESET"' } }, 400)

  const supabase: any = await createServiceClient()

  const tables: { name: string; key: string }[] = [
    { name: 'ankr_action_calls', key: 'id' },
    { name: 'ankr_message_citations', key: 'message_id' },
    { name: 'ankr_messages', key: 'id' },
    { name: 'ankr_thread_topics', key: 'thread_id' },
    { name: 'ankr_thread_state', key: 'thread_id' },
    { name: 'ankr_embeddings', key: 'snippet_id' },
    { name: 'ankr_notes', key: 'id' },
    { name: 'ankr_snippets', key: 'id' },
    { name: 'ankr_topics', key: 'id' },
    { name: 'ankr_threads', key: 'id' },
  ]
  const counts: Record<string, number> = {}
  for (const t of tables) {
    try {
      const meta = await supabase.from(t.name).select(t.key, { count: 'exact', head: true })
      if ((meta as any)?.error && (meta as any).error?.code === '42P01') {
        // table does not exist in this environment; skip
        continue
      }
      const current = meta?.count || 0
      const del = await supabase.from(t.name).delete().not(t.key as any, 'is', null)
      if ((del as any)?.error) throw (del as any).error
      counts[t.name] = current
    } catch (e: any) {
      const msg = String(e?.message || e)
      // If relation missing, skip; else fail
      if (msg.includes('42P01') || /relation .* does not exist/i.test(msg)) continue
      return json({ error: { code: 'RESET_FAILED', table: t.name, message: msg } }, 500)
    }
  }
  return json({ ok: true, counts })
}

function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
}
