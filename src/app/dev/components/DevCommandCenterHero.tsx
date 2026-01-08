"use client"

import { useRouter } from "next/navigation"

// --- Types ---

export type ProjectMeta = {
  id: string
  name: string
  client: string
  branch: string
  env: "preview" | "prod" | "dev"
  deploy: "ready" | "running" | "failed"
  tasksDue: number
  lastActivity: string
}

export type LeadMeta = {
  id: string
  name: string
  status: string
  created_at: string
}

export type InboundItem = {
  id: string
  type: 'message' | 'quote'
  name: string
  detail: string
  status: string
  amount?: string // only for quotes
  created_at: string
}

export type DevCommandCenterHeroProps = {
  onAction?: (action: string, ctx: any) => void
  className?: string
  initialProjects?: ProjectMeta[]
  initialLeads?: LeadMeta[]
  initialInbound?: InboundItem[]
  activeAction?: string | null
  activeCtx?: any
}

// --- Icons ---
const Icons = {
  Grid: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Users: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Inbox: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
  Plus: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  ExternalLink: () => <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  Loader: () => <svg className="size-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
}

// --- Helper Functions ---
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'new': return 'bg-blue-500'
    case 'contacted': return 'bg-yellow-500'
    case 'qualified': return 'bg-green-500'
    case 'lost': return 'bg-red-500'
    case 'won': return 'bg-emerald-500'
    case 'in_progress': return 'bg-amber-500'
    case 'ready': return 'bg-emerald-500'
    case 'failed': return 'bg-rose-500'
    default: return 'bg-neutral-400'
  }
}

function timeSince(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export default function DevCommandCenterHero({ 
  onAction, 
  className, 
  initialProjects = [], 
  initialLeads = [], 
  initialInbound = [],
  activeAction = null,
  activeCtx = null
}: DevCommandCenterHeroProps) {
  const router = useRouter()

  const handleProjectClick = (projectId: string) => {
    if (activeAction) return
    if (onAction) onAction('view_project', { projectId })
  }

  const handleNewProject = () => {
    if (activeAction) return
    if (onAction) onAction('new_project', {})
  }

  return (
    <div className={`flex flex-col gap-6 ${className || ''}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Command Center</h1>
          <p className="text-sm text-neutral-500">System Overview & Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* --- Card 1: Projects (Driver Seat) --- */}
        <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 h-96">
          <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                <Icons.Grid />
              </div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Projects</span>
            </div>
            <button 
              onClick={handleNewProject}
              disabled={activeAction === 'new_project'}
              className="flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 disabled:opacity-50"
            >
              {activeAction === 'new_project' ? <Icons.Loader /> : <Icons.Plus />} 
              {activeAction === 'new_project' ? 'Opening...' : 'New'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {initialProjects.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-400">No active projects.</div>
            ) : (
              <div className="flex flex-col gap-1">
                {initialProjects.map(p => {
                  const isViewing = activeAction === 'view_project' && activeCtx?.projectId === p.id
                  return (
                    <button 
                      key={p.id}
                      onClick={() => handleProjectClick(p.id)}
                      disabled={!!activeAction}
                      className="group flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer disabled:cursor-wait"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`size-2 rounded-full ${getStatusColor(p.deploy)}`} />
                        <div>
                          <div className="text-sm font-semibold text-neutral-900 dark:text-white">{p.name}</div>
                          <div className="text-xs text-neutral-500">{p.client}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isViewing ? (
                          <Icons.Loader />
                        ) : (
                          <>
                            {p.tasksDue > 0 && (
                              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
                                <span className="font-bold">{p.tasksDue}</span> due
                              </div>
                            )}
                            <div className="text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100">
                              <Icons.ExternalLink />
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div className="border-t border-neutral-100 p-3 text-center text-xs text-neutral-400 dark:border-neutral-800 shrink-0">
             <button onClick={() => router.push('/dev/projects')} className="hover:text-neutral-600 dark:hover:text-neutral-300">View All Projects &rarr;</button>
          </div>
        </div>

        {/* --- Card 2: Leads (Pipeline) --- */}
        <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 h-96">
          <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800 shrink-0">
             <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Icons.Users />
              </div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Recent Leads</span>
            </div>
            <div className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
               {initialLeads.length}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {initialLeads.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-400">No recent leads.</div>
            ) : (
              <div className="flex flex-col gap-1">
                {initialLeads.map(l => (
                  <button 
                    key={l.id} 
                    onClick={() => router.push(`/dev/leads/${l.id}`)}
                    className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
                  >
                     <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                           <span className="text-sm font-medium text-neutral-900 dark:text-white">{l.name}</span>
                           <span className="text-xs text-neutral-500 capitalize">{l.status.replace('_', ' ')}</span>
                        </div>
                     </div>
                     <span className="text-[10px] text-neutral-400">{timeSince(l.created_at)} ago</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-neutral-100 p-3 text-center text-xs text-neutral-400 dark:border-neutral-800 shrink-0">
             <button onClick={() => router.push('/dev/leads')} className="hover:text-neutral-600 dark:hover:text-neutral-300">Manage Leads &rarr;</button>
          </div>
        </div>

        {/* --- Card 3: Inbound (Combined) --- */}
        <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 h-96">
           <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800 shrink-0">
             <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Icons.Inbox />
              </div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Inbound</span>
            </div>
            <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
               {initialInbound.length}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {initialInbound.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-400">No recent messages.</div>
            ) : (
               <div className="flex flex-col gap-1">
                {initialInbound.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => router.push(`/dev/msgs/${item.id}`)}
                    className="flex w-full flex-col gap-1 rounded-xl p-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
                  >
                     <div className="flex w-full items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                            ${item.type === 'quote' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}>
                            {item.type}
                          </span>
                          <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 whitespace-nowrap">{timeSince(item.created_at)}</span>
                     </div>
                     <div className="text-xs text-neutral-500 line-clamp-2 w-full">
                        {item.detail}
                     </div>
                     {item.type === 'quote' && item.amount && (
                       <div className="mt-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-500">
                         Budget: {item.amount}
                       </div>
                     )}
                  </button>
                ))}
               </div>
            )}
          </div>
          <div className="border-t border-neutral-100 p-3 text-center text-xs text-neutral-400 dark:border-neutral-800 shrink-0">
             <button onClick={() => router.push('/dev/msgs')} className="hover:text-neutral-600 dark:hover:text-neutral-300">View All Inbound &rarr;</button>
          </div>
        </div>

      </div>
    </div>
  )
}
