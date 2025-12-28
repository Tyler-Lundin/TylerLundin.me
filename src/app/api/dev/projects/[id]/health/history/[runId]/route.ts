import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; runId: string }> }) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { id, runId } = await params
  const sb = await createServiceClient()
  const { data, error } = await sb
    .from('crm_project_health_runs')
    .select('id, started_at, finished_at, duration_ms, overall_status, items, endpoint_url, error')
    .eq('project_id', id)
    .eq('id', runId)
    .single()
  if (error || !data) return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

