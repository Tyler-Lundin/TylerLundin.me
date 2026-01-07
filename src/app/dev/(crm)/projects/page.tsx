import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { Search, Plus } from 'lucide-react'
import { CrmProject } from '@/types/crm'
import ProjectsTable from './ProjectsTable'

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
            <Link href="/dev/projects/new" className="flex h-10 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </Link>
          </div>
        </div>

        {/* Projects Table */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
             <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">All Projects</h3>
          </div>
          <ProjectsTable initialProjects={projectsList} />
        </div>
      </div>
    </div>
  )
}