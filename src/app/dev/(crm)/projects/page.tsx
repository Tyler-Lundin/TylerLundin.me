import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { Search, Plus, Folder, Calendar } from 'lucide-react'
import { CrmProject } from '@/types/crm'
import { slugify } from '@/lib/utils'

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    planned:    'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
    in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    paused:     'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    completed:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    archived:   'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700',
  }
  const style = styles[value] || styles.planned

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${style}`}>
      {value.replace('_', ' ')}
    </span>
  )
}

function PriorityPill({ value }: { value: string }) {
  const styles: Record<string, string> = {
    low:    'text-neutral-500',
    normal: 'text-neutral-700 dark:text-neutral-300',
    high:   'text-amber-600 dark:text-amber-400 font-medium',
    urgent: 'text-rose-600 dark:text-rose-400 font-bold',
  }
  const style = styles[value] || styles.normal

  return <span className={`text-xs capitalize ${style}`}>{value}</span>
}

export default async function CrmProjectsPage() {
  const sb = await createServiceClient()
  const { data: projects } = await sb
    .from('crm_projects')
    .select('*, client:crm_clients(name)')
    .order('created_at', { ascending: false })

  const projectsList = (projects || []) as CrmProject[]

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Projects</h1>
            <p className="text-sm text-neutral-500">Track work by client and status</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                disabled
                placeholder="Search projects..."
                className="h-10 w-64 rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-neutral-900 disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-white"
              />
            </div>
            {/* Future: Add Project Wizard from projects index */}
            <button className="flex h-10 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
             <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">All Projects</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Priority</th>
                  <th className="px-6 py-3 font-medium text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {projectsList.map((p) => (
                  <tr key={p.id} className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          <Folder className="size-4" />
                        </div>
                        <Link className="font-medium text-neutral-900 hover:underline dark:text-white" href={`/dev/projects/${p.slug}`}>
                          {p.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link className="text-neutral-600 hover:text-neutral-900 hover:underline dark:text-neutral-300 dark:hover:text-white" href={`/dev/clients/${slugify(p.client?.name || '')}`}>
                        {p.client?.name || 'Unknown'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge value={p.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityPill value={p.priority} />
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-neutral-500 tabular-nums">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
                {projectsList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">No projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
