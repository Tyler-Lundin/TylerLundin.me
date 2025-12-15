import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase: any = await createServiceClient()
  const { id } = await params
  if (!id) return json({ error: { code: 'BAD_REQUEST', message: 'id required' } }, 400)
  const { data, error } = await supabase.from('ankr_action_calls').select('*').eq('id', id).single()
  if (error) return json({ error: { code: 'DB_FETCH_FAILED', message: error.message } }, 500)
  return json({ action: data })
}

function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
}
