import React from 'react'
import CommandCenter from './components/CommandCenter'
import LeadsOverview from './components/LeadsOverview'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CrmProject, Invoice } from '@/types/crm'

// --- Icons ---
const Icons = {
  TrendingUp: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Users: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Folder: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Clock: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ArrowRight: () => <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
}

// --- Internal Types ---
interface ActivityLogEntry {
  id: string
  action_type: 'deploy' | 'money' | 'edit' | 'create' | string
  description: string
  created_at: string
}

interface TeamInvite {
  id: string
  email: string
  role: string
  expires_at?: string | null
}

// --- Components ---

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


function KpiCard({ title, value, subtext, icon, trend }: { title: string, value: string | number, subtext?: string, icon?: React.ReactNode, trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{title}</span>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</div>
        {subtext && (
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
             {trend === 'up' && <span className="text-emerald-600 font-medium">↑ 12%</span>}
             {trend === 'down' && <span className="text-rose-600 font-medium">↓ 5%</span>}
             <span>{subtext}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

async function fetchData() {
  const sb = await createClient()
  
  // Parallel fetch for dashboard stats
  const [
    { count: clientsCount },
    { count: projectsCount },
    { count: openItemsCount },
    { count: invitesCount },
    { data: recentProjects },
    { data: pendingInvites },
    { data: activityLog },
    { data: openInvoices },
    { data: overdueInvoices }
  ] = await Promise.all([
    sb.from('crm_clients').select('*', { count: 'exact', head: true }),
    sb.from('crm_projects').select('*', { count: 'exact', head: true }),
    sb.from('crm_project_list_items').select('*', { count: 'exact', head: true }).neq('status', 'done'),
    sb.from('team_invites').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    
    // Recent Projects
    sb.from('crm_projects')
      .select('*, client:crm_clients(name)')
      .order('created_at', { ascending: false })
      .limit(5),

    // Pending Invites
    sb.from('team_invites')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
      
    // Activity Log
    sb.from('crm_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),

    // Financials
    sb.from('invoices').select('amount_cents').eq('status', 'open'),
    sb.from('invoices').select('amount_cents').eq('status', 'open').lt('due_at', new Date().toISOString())
  ])

  // Aggregate Finance
  const open_invoices_cents = ((openInvoices || []) as Pick<Invoice, 'amount_cents'>[]).reduce((acc, curr) => acc + curr.amount_cents, 0)
  const overdue_cents = ((overdueInvoices || []) as Pick<Invoice, 'amount_cents'>[]).reduce((acc, curr) => acc + curr.amount_cents, 0)

  return {
    counts: {
      clients: clientsCount || 0,
      projects: projectsCount || 0,
      openItems: openItemsCount || 0,
      invites: invitesCount || 0,
    },
    recentProjects: (recentProjects || []) as CrmProject[],
    pendingInvites: (pendingInvites || []) as TeamInvite[],
    activityLog: (activityLog || []) as ActivityLogEntry[],
    finance: {
      mrr_cents: 0, 
      open_invoices_cents,
      overdue_cents,
    }
  }
}

export default async function CrmDashboard() {
  const { counts, recentProjects, pendingInvites, activityLog, finance } = await fetchData()

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* 1. Command Center */}
        <div className="mb-8">
          {/* Server wrapper provides initial projects via service client */}
          <CommandCenter />
        </div>

        {/* Leads Overview */}
        <div className="mb-8">
          <LeadsOverview />
        </div>

        {/* 2. Finance Section (High Priority) */}
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Financial Health</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard 
              title="MRR" 
              value={formatCurrency(finance.mrr_cents)} 
              subtext="vs last month" 
              trend="neutral"
              icon={<Icons.TrendingUp />}
            />
            <KpiCard 
              title="Outstanding" 
              value={formatCurrency(finance.open_invoices_cents)} 
              subtext="All open invoices"
              icon={<span className="text-amber-500">●</span>}
            />
             <KpiCard 
              title="Overdue" 
              value={formatCurrency(finance.overdue_cents)} 
              subtext="Action needed"
              icon={<span className="text-rose-500">●</span>}
            />
          </div>
        </section>

        {/* 3. Operational Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column: Projects Table (2/3 width) */}
          <div className="lg:col-span-2">
            
            {/* Stats Row */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Active Clients", val: counts.clients, icon: <Icons.Users /> },
                { label: "Active Projects", val: counts.projects, icon: <Icons.Folder /> },
                { label: "Open Tasks", val: counts.openItems, icon: <Icons.Clock /> },
                { label: "Invites", val: counts.invites, icon: <span className="flex size-2 rounded-full bg-blue-500" /> },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-center gap-2 text-[10px] font-medium text-neutral-500 uppercase">
                    {s.icon} {s.label}
                  </div>
                  <div className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">{s.val}</div>
                </div>
              ))}
            </div>

            {/* Recent Projects Card */}
            <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Recent Projects</h2>
                <Link href="/dev/projects" className="group flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  View all <Icons.ArrowRight />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                    <tr>
                      <th className="px-6 py-3 font-medium">Project Name</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Priority</th>
                      <th className="px-6 py-3 font-medium text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {recentProjects.map((p) => (
                      <tr key={p.id} className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">{p.title}</div>
                          <div className="text-xs text-neutral-500">{p.client?.name || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge value={p.status} />
                        </td>
                        <td className="px-6 py-4">
                          <PriorityPill value={p.priority} />
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-neutral-400 tabular-nums">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {recentProjects.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-neutral-500">No active projects</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Column: Feeds (1/3 width) */}
          <div className="flex flex-col gap-6">
            
            {/* Pending Invites */}
            <section className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Pending Invites</h3>
              </div>
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {pendingInvites.map((i) => (
                  <li key={i.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">{i.email}</div>
                      <div className="text-xs text-neutral-500">{i.role}</div>
                    </div>
                    <div className="rounded bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {i.expires_at ? new Date(i.expires_at).toLocaleDateString() : 'No Expiry'}
                    </div>
                  </li>
                ))}
                {pendingInvites.length === 0 && (
                  <li className="px-5 py-3 text-sm text-neutral-500">No pending invites</li>
                )}
              </ul>
              <div className="border-t border-neutral-100 bg-neutral-50 p-2 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                 <Link href="/dev/team" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300">Manage Team</Link>
              </div>
            </section>

            {/* Activity Feed */}
            <section className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Recent Activity</h3>
              </div>
              <ul className="relative space-y-4 px-5 py-4">
                {/* Connector Line */}
                <div className="absolute left-[29px] top-6 bottom-6 w-px bg-neutral-200 dark:bg-neutral-800" />
                
                {activityLog.map((a) => (
                  <li key={a.id} className="relative flex gap-3">
                    <div className={`relative z-10 flex size-2.5 mt-1.5 flex-none rounded-full ring-4 ring-white dark:ring-neutral-900 
                      ${a.action_type === 'deploy' ? 'bg-emerald-500' : a.action_type === 'money' ? 'bg-amber-500' : 'bg-blue-500'}`} 
                    />
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        {a.description}
                      </p>
                      <p className="text-xs text-neutral-400">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
                {activityLog.length === 0 && (
                  <li className="text-sm text-neutral-500 pl-4">No recent activity logged.</li>
                )}
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
