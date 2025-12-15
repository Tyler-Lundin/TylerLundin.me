import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateAckBody } from '@/lib/ankr/validation'

// Acknowledge an action request (e.g., picked up by executor)
// body: { acknowledgedBy?: string }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase: any = await createServiceClient()
  const { id } = await params
  if (!id) return json({ error: { code: 'BAD_REQUEST', message: 'id required' } }, 400)
  const raw = await req.json().catch(() => ({}))
  let body: any
  try { body = await validateAckBody(raw) } catch (e: any) { return json({ error: { code: 'BAD_REQUEST', message: e?.message || 'validation failed' } }, 400) }
  const { data, error } = await supabase
    .from('ankr_action_calls')
    .update({ status: 'acknowledged', acknowledged_by: body.acknowledgedBy ?? 'dev' })
    .eq('id', id)
    .select('*')
    .single()
  if (error) return json({ error: { code: 'DB_UPDATE_FAILED', message: error.message } }, 500)
  return json({ action: data })
}

function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
}
