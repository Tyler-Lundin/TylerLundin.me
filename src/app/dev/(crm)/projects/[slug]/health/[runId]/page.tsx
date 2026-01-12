import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import HealthItem from '@/components/dev/health/HealthItem'
import { ChevronLeft, Clock, Globe, Zap, AlertCircle } from 'lucide-react'

type PageProps = { params: Promise<{ slug: string; runId: string }> }

export default async function ProjectHealthRunPage(props: PageProps) {
  const { slug, runId } = await props.params
  let sb: any
  try { sb = getSupabaseAdmin() } catch { return notFound() }
  
  const { data: project } = await sb
    .from('crm_projects')
    .select('id, title')
    .eq('slug', slug)
    .single()
    
  if (!project) return notFound()

  const { data: run } = await sb
    .from('crm_project_health_runs')
    .select('id, started_at, finished_at, duration_ms, overall_status, items, endpoint_url, error')
    .eq('project_id', project.id)
    .eq('id', runId)
    .single()

  if (!run) return notFound()

  const items = (run.items as any[]) || []
  const isError = !!run.error || run.overall_status?.toLowerCase() === 'error'

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 antialiased">
      <div className="max-w-5xl mx-auto px-6 ">
        
        {/* Breadcrumb & Actions */}
        <nav className="mb-8">
          <Link 
            href={`/dev/projects/${slug}/health`} 
            className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Back to history
          </Link>
        </nav>

        {/* Hero Header */}
        <header className="mb-10 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold tracking-tight">Run Details</h1>
                <StatusPill status={run.overall_status} />
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                {project.title} <span className="mx-2 text-neutral-300 dark:text-neutral-700">/</span> {new Date(run.started_at as any).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
            
            {/* Meta Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">Duration</span>
                <div className="flex items-center gap-1.5 font-medium tabular-nums">
                  <Zap size={14} className="text-amber-500" />
                  {run.duration_ms ?? 0}ms
                </div>
              </div>
              <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">Target</span>
                <div className="flex items-center gap-1.5 font-medium">
                  <Globe size={14} className="text-blue-500" />
                  <span className="font-mono text-[13px]">{run.endpoint_url ? new URL(run.endpoint_url as string).hostname : '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {run.error && (
            <div className="mt-6 p-4 rounded-lg bg-rose-50 border border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/20 flex gap-3">
              <AlertCircle className="text-rose-600 dark:text-rose-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-rose-900 dark:text-rose-400">System Error</p>
                <p className="text-sm text-rose-700 dark:text-rose-500/80 font-mono mt-1">{run.error}</p>
              </div>
            </div>
          )}
        </header>

        {/* Run Items List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Check Results</h2>
            <span className="text-xs text-neutral-500">{items.length} checks performed</span>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {items.length > 0 ? (
                items.map((it, idx) => (
                  <div key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <HealthItem item={it} />
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-neutral-500">
                  No diagnostic items found for this run.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const label = status?.toLowerCase() || 'unknown'
  const isHealthy = label === 'healthy' || label === 'success' || label === 'ok'
  
  return (
    <span className={`text-[11px] font-bold uppercase tracking-tighter px-2.5 py-0.5 rounded-md border ${
      isHealthy 
        ? 'bg-emerald-500 text-white border-emerald-600' 
        : 'bg-rose-500 text-white border-rose-600'
    }`}>
      {label}
    </span>
  )
}
