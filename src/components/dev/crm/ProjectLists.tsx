"use client"
import React, { useMemo, useState } from 'react'
import NewListDialog from '@/app/dev/(crm)/projects/[slug]/components/NewListDialog'
import NewTaskDialog from '@/app/dev/(crm)/projects/[slug]/components/NewTaskDialog'

type ListKey = 'goals' | 'bugs' | 'tasks' | 'custom' | string
type ItemStatus = 'open' | 'in_progress' | 'done' | 'todo' | string
type ItemPriority = 'low' | 'normal' | 'high' | 'urgent' | string

export type ProjectListItem = {
  id: string
  list_id: string
  title: string
  description?: string | null
  status: ItemStatus
  priority: ItemPriority
  assignee_user_id?: string | null
  due_at?: string | null
  sort?: number | null
  is_client_visible?: boolean
  created_at?: string
}

export type ProjectList = {
  id: string
  project_id: string
  key: ListKey
  title: string
  created_at?: string
  items?: ProjectListItem[]
}

function StatusBadge({ value }: { value: ItemStatus }) {
  const norm = value === 'todo' ? 'open' : value
  const map: Record<string, string> = {
    open: 'bg-[#1E1F22] border-[#3F4147] text-[#DBDEE1]',
    in_progress: 'bg-[#0E3A2A] border-[#0B4A34] text-[#9FEFBC]',
    done: 'bg-[#0E2A3A] border-[#0B364A] text-[#93C5FD]',
  }
  return <span className={`px-1.5 py-0.5 text-[10px] rounded border capitalize ${map[norm] || map.open}`}>{norm}</span>
}

function PriorityPill({ value }: { value: ItemPriority }) {
  const map: Record<string, string> = {
    low: 'bg-[#1E1F22] text-[#949BA4] border-[#3F4147]',
    normal: 'bg-[#1E1F22] text-[#DBDEE1] border-[#3F4147]',
    high: 'bg-[#3A0E0E] text-[#FCA5A5] border-[#4A0B0B]',
    urgent: 'bg-[#4A0B0B] text-[#F87171] border-[#7F1D1D]',
  }
  return <span className={`px-1.5 py-0.5 text-[10px] rounded border capitalize ${map[value] || map.normal}`}>{value}</span>
}

export default function ProjectLists({ lists, pinnedListIds = [] }: { lists: ProjectList[]; pinnedListIds?: string[] }) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'done'>('all')
  const [clientOnly, setClientOnly] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filteredLists = useMemo(() => {
    return (lists || []).map((l) => {
      const items = (l.items || []).filter((it) => {
        const status = it.status === 'todo' ? 'open' : it.status
        const passStatus = statusFilter === 'all' || status === statusFilter
        const passClient = !clientOnly || !!it.is_client_visible
        return passStatus && passClient
      })
      return { ...l, items: items.sort((a, b) => (a.sort || 0) - (b.sort || 0)) }
    })
  }, [lists, statusFilter, clientOnly])

  const pinned = useMemo(() => {
    if (!pinnedListIds?.length) return [] as ProjectList[]
    const map = new Map(lists.map((l) => [l.id, l]))
    return pinnedListIds.map((id) => map.get(id)).filter(Boolean) as ProjectList[]
  }, [lists, pinnedListIds])

  function toggle(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const projectId = lists.length > 0 ? lists[0].project_id : ''

  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 shadow-sm transition-all">
      <div className="px-5 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Project Lists</h2>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5">
            <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</FilterChip>
            <FilterChip active={statusFilter === 'open'} onClick={() => setStatusFilter('open')}>Open</FilterChip>
            <FilterChip active={statusFilter === 'in_progress'} onClick={() => setStatusFilter('in_progress')}>Active</FilterChip>
            <FilterChip active={statusFilter === 'done'} onClick={() => setStatusFilter('done')}>Done</FilterChip>
          </div>
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
          <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase cursor-pointer">
            <input type="checkbox" className="accent-blue-600 rounded border-neutral-300" checked={clientOnly} onChange={(e) => setClientOnly(e.target.checked)} />
            Client Portal
          </label>
          {projectId && <NewListDialog projectId={projectId} />}
        </div>
      </div>

      {/* Pinned mini lists */}
      {pinned.length > 0 && (
        <div className="bg-neutral-50/50 dark:bg-neutral-950/20 border-b border-neutral-100 dark:border-neutral-800 px-5 py-4">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Pinned Boards</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pinned.map((l) => (
              <div key={l.id} className="relative rounded-2xl shadow-sm border border-amber-200/60 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800/50 text-neutral-900 dark:text-neutral-100 p-4 transform transition-all hover:-translate-y-0.5">
                <div className="text-xs font-bold mb-3 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  {l.title}
                </div>
                <ul className="space-y-2">
                  {(l.items || []).slice(0, 4).map((it) => (
                    <li key={it.id} className="flex items-start gap-2 text-[11px] font-medium leading-tight">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full mt-1 shrink-0 ${
                        (it.status === 'done') ? 'bg-blue-500' : (it.status === 'in_progress') ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      <span className="truncate opacity-80">{it.title}</span>
                    </li>
                  ))}
                  {(l.items || []).length === 0 && (
                    <li className="text-[11px] opacity-50 italic">No goals defined</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        {filteredLists.map((l) => (
          <div key={l.id} className="p-0 transition-all">
            <div className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
              <div className="flex items-center gap-3">
                <button onClick={() => toggle(l.id)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all">
                  <span className={`inline-block w-4 transition-transform duration-200 ${collapsed[l.id] ? '' : 'rotate-90'}`}>▶</span>
                </button>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{l.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500">{l.items?.length || 0}</span>
              </div>
              <NewTaskDialog listId={l.id} />
            </div>
            {!collapsed[l.id] && (
              <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <ul className="space-y-2">
                  {(l.items || []).map((it) => (
                    <li key={it.id} className="group rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-950/20 p-3 transition-all hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-white dark:hover:bg-neutral-900">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 transition-colors">{it.title}</div>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                              {it.due_at ? `Due ${new Date(it.due_at).toLocaleDateString()}` : 'No deadline'}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${it.is_client_visible ? 'text-emerald-500' : 'text-neutral-400 opacity-60'}`}>
                              {it.is_client_visible ? 'Portal Visible' : 'Internal'}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <StatusBadge value={it.status} />
                          <PriorityPill value={it.priority} />
                        </div>
                      </div>
                    </li>
                  ))}
                  {(l.items || []).length === 0 && (
                    <li className="py-6 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-xl">
                       <p className="text-xs font-medium text-neutral-400">Empty collection</p>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
        {filteredLists.length === 0 && (
          <div className="py-20 text-center">
             <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">No project lists found</p>
             <p className="mt-1 text-xs text-neutral-500">Create a list to start tracking items.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
        active 
          ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-md' 
          : 'bg-transparent border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 dark:border-neutral-800 dark:hover:border-neutral-700'
      }`}
    >
      {children}
    </button>
  )
}