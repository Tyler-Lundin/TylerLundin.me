import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { ChevronLeft, ChevronRight, Activity, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'

type PageProps = { 
  params: Promise<{ slug: string }>, 
  searchParams?: Promise<{ page?: string }> 
}

export default async function ProjectHealthIndex(props: PageProps) {
  const { slug } = await props.params
  const sp = (await props.searchParams) || {}
  const page = Math.max(1, Number(sp.page || '1'))
  const perPage = 20
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const sb = await createServiceClient()
  const { data: project } = await sb
    .from('crm_projects')
    .select('id, title')
    .eq('slug', slug)
    .single()

  if (!project) return notFound()

  const [{ count }, { data, error }] = await Promise.all([
    sb.from('crm_project_health_runs')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id),
    sb.from('crm_project_health_runs')
      .select('id, started_at, finished_at, duration_ms, overall_status, error')
      .eq('project_id', project.id)
      .order('started_at', { ascending: false })
      .range(from, to)
  ])

  if (error) return notFound()

  const total = count || 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const runs = data || []

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 dark:bg-[#050505] dark:text-neutral-100 font-sans antialiased">
      <div className="max-w-5xl mx-auto px-6 ">
        
        {/* Header Section */}
        <header className="mb-10 flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Activity size={18} strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-widest">System Monitor</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Health Runs</h1>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">{project.title}</p>
          </div>
          <Link 
            href={`/dev/projects/${slug}`} 
            className="group flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors dark:hover:text-white"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Back to Project
          </Link>
        </header>

        {/* Table Container */}
        <div className="relative overflow-hidden bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02),0_12px_24px_-12px_rgba(0,0,0,0.03)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <th className="px-6 py-4 text-[13px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Started</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Messages</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 italic">
                    No health records found for this project.
                  </td>
                </tr>
              ) : (
                runs.map((r) => (
                  <tr key={r.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
                      {new Date(r.started_at as any).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.overall_status} />
                    </td>
                    <td className="px-6 py-4 tabular-nums text-neutral-500">
                      {r.duration_ms ? `${(r.duration_ms / 1000).toFixed(2)}s` : '—'}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-neutral-400">
                      {r.error && (
                        <div className="flex items-center gap-1.5 text-rose-500">
                          <AlertCircle size={14} />
                          <span className="text-xs">{r.error}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/dev/projects/${slug}/health/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        DETAILS <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <footer className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 flex items-center justify-between">
            <p className="text-xs text-neutral-500 font-medium">
              Showing <span className="text-neutral-900 dark:text-white">{from + 1}-{Math.min(to + 1, total)}</span> of <span className="text-neutral-900 dark:text-white">{total}</span>
            </p>
            <div className="flex gap-1">
              <PaginationLink href={`?page=${page - 1}`} disabled={page <= 1}>
                <ChevronLeft size={16} />
              </PaginationLink>
              <PaginationLink href={`?page=${page + 1}`} disabled={page >= totalPages}>
                <ChevronRight size={16} />
              </PaginationLink>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status.toLowerCase() === 'success' || status.toLowerCase() === 'healthy'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
      isSuccess 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
        : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
    }`}>
      {isSuccess && <CheckCircle2 size={12} />}
      {status}
    </span>
  )
}

function PaginationLink({ href, children, disabled }: { href: string, children: React.ReactNode, disabled?: boolean }) {
  if (disabled) return (
    <span className="p-2 rounded-lg text-neutral-300 dark:text-neutral-700 cursor-not-allowed">
      {children}
    </span>
  )
  return (
    <Link href={href} className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors">
      {children}
    </Link>
  )
}
