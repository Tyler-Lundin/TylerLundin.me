import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runHealthForProject } from '@/lib/health/run'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const key = req.headers.get('x-cron-key') || ''
  const vercelCron = req.headers.get('x-vercel-cron')
  const allow = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET || ''
  // Allow either signed header OR Vercel Cron header
  if (!vercelCron && (!allow || key !== allow)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = await createServiceClient()
  const { data: projects } = await sb
    .from('crm_projects')
    .select('id')
    .eq('project_health_enabled', true)
    .not('project_health_url', 'is', null)

  const ids = (projects || []).map((p: any) => p.id)
  const MAX_PROJECTS = Number(process.env.CRON_MAX_PROJECTS || 50)
  const CONCURRENCY = Number(process.env.CRON_CONCURRENCY || 3)
  const DEADLINE_MS = Number(process.env.CRON_DEADLINE_MS || 50000)
  const selected = ids.slice(0, MAX_PROJECTS)

  let ok = 0, warn = 0, error = 0, pending = 0
  const results: Record<string, any> = {}
  const started = Date.now()

  // Simple promise pool to cap concurrency and enforce global deadline
  let i = 0
  async function worker() {
    while (i < selected.length) {
      const idx = i++
      if (Date.now() - started > DEADLINE_MS) break
      const id = selected[idx]
      try {
        const items = await runHealthForProject(id, sb)
        results[id] = items
        const worst = items.reduce<'ok'|'warn'|'error'|'pending'>((acc, it) => {
          if (it.status === 'error') return 'error'
          if (it.status === 'warn' && acc !== 'error') return 'warn'
          if (it.status === 'pending' && acc === 'ok') return 'pending'
          return acc
        }, 'ok')
        if (worst === 'ok') ok++
        else if (worst === 'warn') warn++
        else if (worst === 'pending') pending++
        else error++
      } catch (e: any) {
        error++
        results[id] = { error: e?.message || 'run failed' }
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, selected.length) }, () => worker())
  await Promise.all(workers)

  return NextResponse.json({
    projects: selected.length,
    ok, warn, error, pending,
    truncated: ids.length > selected.length,
    elapsed_ms: Date.now() - started,
    at: new Date().toISOString(),
  })
}
