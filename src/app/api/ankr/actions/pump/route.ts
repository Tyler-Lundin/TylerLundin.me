import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { executeActionCall } from '@/lib/ankr/actions/registry'
import { validatePumpBody } from '@/lib/ankr/validation'

// Process a small batch of requested actions; dev-only helper
// body: { limit?: number, executor?: string }
export async function POST(req: NextRequest) {
  const supabase: any = await createServiceClient()
  const raw = await req.json().catch(() => ({}))
  let body: any
  try { body = await validatePumpBody(raw) } catch (e: any) { return json({ error: { code: 'BAD_REQUEST', message: e?.message || 'validation failed' } }, 400) }
  const limit = Math.min(Math.max(1, Number(body.limit) || 5), 20)
  const executor = typeof body.executor === 'string' && body.executor.trim() ? body.executor : 'dev'
  try {
    const { data, error } = await supabase
      .from('ankr_action_calls')
      .select('id')
      .eq('status', 'requested')
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) throw error
    const ids = (data || []).map((r: any) => r.id)
    const results = [] as any[]
    for (const id of ids) {
      try {
        const row = await executeActionCall(supabase, id, executor)
        results.push({ id, status: row.status })
      } catch (e: any) {
        results.push({ id, error: String(e?.message || e) })
      }
    }
    return json({ processed: results.length, results })
  } catch (e: any) {
    return json({ error: { code: 'PUMP_FAILED', message: String(e?.message || e) } }, 500)
  }
}

function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
}
