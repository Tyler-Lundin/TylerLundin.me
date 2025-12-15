import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { executeActionCall } from '@/lib/ankr/actions/registry'
import { validateExecuteBody } from '@/lib/ankr/validation'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase: any = await createServiceClient()
  const { id } = await params
  if (!id) return json({ error: { code: 'BAD_REQUEST', message: 'id required' } }, 400)
  const raw = await req.json().catch(() => ({}))
  let body: any
  try { body = await validateExecuteBody(raw) } catch (e: any) { return json({ error: { code: 'BAD_REQUEST', message: e?.message || 'validation failed' } }, 400) }
  const executor = typeof body.executor === 'string' && body.executor.trim() ? body.executor : 'dev'
  try {
    const row = await executeActionCall(supabase, id, executor, { force: !!body.force })
    return json({ action: row })
  } catch (e: any) {
    return json({ error: { code: 'EXECUTE_FAILED', message: String(e?.message || e) } }, 500)
  }
}

function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
}
