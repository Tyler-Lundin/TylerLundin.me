import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { id } = await params
  const sb = await createServiceClient()
  const { searchParams } = new URL(_req.url)
  const limit = Number(searchParams.get('limit') || 10)
  const { data, error } = await sb
    .from('crm_project_health_runs')
    .select('id, started_at, finished_at, duration_ms, overall_status, error')
    .eq('project_id', id)
    .order('started_at', { ascending: false })
    .limit(Math.max(1, Math.min(100, limit)))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

