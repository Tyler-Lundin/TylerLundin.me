import React from 'react'
import { ensureProfileOrRedirect } from '@/lib/profile'
import CommandCenter from './components/CommandCenter'
import LeadsOverview from '@/components/ops/LeadsOverview'
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
  created_at: string
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
  await ensureProfileOrRedirect()
  const { counts, recentProjects, pendingInvites, activityLog, finance } = await fetchData()

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* 1. Command Center (Driver Seat) */}
        <div className="mb-8">
          <CommandCenter />
        </div>

        {/* 2. Leads Overview (Intelligence) */}
        <div className="mb-8">
          <LeadsOverview />
        </div>

        {/* 3. System Status (Operations) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Finance Card */}
          <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 h-96">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  <Icons.TrendingUp />
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Financials</span>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-3">
               <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase">Monthly Revenue</div>
                  <div className="text-2xl font-black text-neutral-900 dark:text-white">{formatCurrency(finance.mrr_cents)}</div>
               </div>
               <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase">Outstanding Invoices</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(finance.open_invoices_cents)}</div>
               </div>
               <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase">Overdue Amount</div>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(finance.overdue_cents)}</div>
               </div>
            </div>
          </div>

          {/* Pending Team Card */}
          <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 h-96">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <Icons.Users />
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Team Status</span>
              </div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase">{pendingInvites.length} Pending</div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {pendingInvites.length === 0 ? (
                <div className="p-8 text-center text-sm text-neutral-400 italic">No pending invitations.</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {pendingInvites.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{i.email}</div>
                        <div className="text-[10px] text-neutral-500 uppercase">{i.role}</div>
                      </div>
                      <span className="text-[10px] text-neutral-400">Sent {new Date(i.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-neutral-100 p-3 text-center text-xs text-neutral-400 dark:border-neutral-800 shrink-0">
               <Link href="/dev/team" className="hover:text-neutral-600 dark:hover:text-neutral-300">Manage Team &rarr;</Link>
            </div>
          </div>

          {/* Activity Card */}
          <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 h-96">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                  <Icons.Clock />
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">System Activity</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {activityLog.length === 0 ? (
                <div className="p-8 text-center text-sm text-neutral-400 italic">No recent activity.</div>
              ) : (
                <div className="relative space-y-6">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-neutral-100 dark:bg-neutral-800" />
                  {activityLog.map(a => (
                    <div key={a.id} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 size-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-neutral-950" />
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">{a.description}</p>
                      <p className="text-[10px] text-neutral-400 mt-1">{new Date(a.created_at).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-neutral-100 p-3 text-center text-xs text-neutral-400 dark:border-neutral-800 shrink-0">
               <Link href="/dev/logs" className="hover:text-neutral-600 dark:hover:text-neutral-300">View Audit Logs &rarr;</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
