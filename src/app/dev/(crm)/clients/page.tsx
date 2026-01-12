import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { Search, Plus, Building2, ExternalLink, Calendar } from 'lucide-react'
import NewClientWizard from './components/NewClientWizard'
import ClientsTable from './components/ClientsTable'
import { slugify } from '@/lib/utils'

export default async function CrmClientsPage() {
  let sb: any
  try { sb = getSupabaseAdmin() } catch { sb = null }
  const { data: clients, error } = sb ? await sb
    .from('crm_clients')
    .select('*')
    .order('created_at', { ascending: false }) : { data: [], error: null as any }

  if (error) {
    console.error('[CrmClientsPage] fetch error:', error)
  }

  const clientsList = (clients || []) as any[]

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
          <ClientsTable initialClients={clientsList} />
        </div>
      </div>
    </div>
  )
}
