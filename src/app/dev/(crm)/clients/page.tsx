import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { Search, Plus, Building2, ExternalLink, Calendar } from 'lucide-react'
import NewClientWizard from './components/NewClientWizard'
import { slugify } from '@/lib/utils'

export default async function CrmClientsPage() {
  const sb = await createServiceClient()
  const { data: clients, error } = await sb
    .from('crm_clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[CrmClientsPage] fetch error:', error)
  }

  const clientsList = clients || []

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Clients</h1>
            <p className="text-sm text-neutral-500">Manage client organizations and contacts</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                disabled
                placeholder="Search clients..."
                className="h-10 w-64 rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-neutral-900 disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-white"
              />
            </div>
            <NewClientWizard />
          </div>
        </div>

        {/* Clients Table */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
             <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">All Clients</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Company</th>
                  <th className="px-6 py-3 font-medium">Website</th>
                  <th className="px-6 py-3 font-medium text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {clientsList.map((c: any) => (
                  <tr key={c.id} className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <Link className="font-medium text-neutral-900 hover:underline dark:text-white" href={`/dev/clients/${slugify(c.name)}`}>
                          {c.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{c.company || '—'}</td>
                    <td className="px-6 py-4">
                      {c.website_url ? (
                        <a href={c.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400">
                          {new URL(c.website_url).hostname}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-neutral-500 tabular-nums">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
                {clientsList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-500">No clients found.</td>
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
