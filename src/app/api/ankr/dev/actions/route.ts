import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const ENABLED = (process.env.ANKR_DEV_ENABLE || '').toLowerCase() === 'true' || process.env.ANKR_DEV_ENABLE === '1'
  if (!ENABLED) return json({ error: { code: 'FORBIDDEN', message: 'Developer actions listing disabled' } }, 403)
  const supabase: any = await createServiceClient()
  const { searchParams } = new URL(req.url)
  const status = (searchParams.get('status') || 'requested').split(',')
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 30), 1), 100)
  try {
    let q = supabase.from('ankr_action_calls').select('id, thread_id, source_message_id, requested_by, action_name, params, status, created_at, updated_at, acknowledged_by, executed_by, executed_at').order('created_at', { ascending: false }).limit(limit)
    if (status.length === 1) q = q.eq('status', status[0])
    else q = (q as any).in('status', status)
    const { data, error } = await q
    if (error) throw error
    return json({ actions: data || [] })
  } catch (e: any) {
    return json({ error: { code: 'LIST_FAILED', message: String(e?.message || e) } }, 500)
  }
}

function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
}

