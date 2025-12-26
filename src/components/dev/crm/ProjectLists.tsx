"use client"
import React, { useMemo, useState } from 'react'

type ListKey = 'goals' | 'bugs' | 'tasks' | 'custom' | string
type ItemStatus = 'open' | 'in_progress' | 'done' | 'todo' | string
type ItemPriority = 'low' | 'normal' | 'high' | 'urgent' | string

export type ProjectListItem = {
  id: string
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
  return <span className={`px-1.5 py-0.5 text-[10px] rounded border ${map[norm] || map.open}`}>{norm}</span>
}

function PriorityPill({ value }: { value: ItemPriority }) {
  const map: Record<string, string> = {
    low: 'bg-[#1E1F22] text-[#949BA4] border-[#3F4147]',
    normal: 'bg-[#1E1F22] text-[#DBDEE1] border-[#3F4147]',
    high: 'bg-[#3A0E0E] text-[#FCA5A5] border-[#4A0B0B]',
    urgent: 'bg-[#4A0B0B] text-[#F87171] border-[#7F1D1D]',
  }
  return <span className={`px-1.5 py-0.5 text-[10px] rounded border ${map[value] || map.normal}`}>{value}</span>
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

  return (
    <section className="rounded-lg border border-[#3F4147] overflow-hidden">
      <div className="px-4 py-3 bg-[#1E1F22] border-b border-[#3F4147] flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Lists</h2>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[11px]">
            <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</FilterChip>
            <FilterChip active={statusFilter === 'open'} onClick={() => setStatusFilter('open')}>Open</FilterChip>
            <FilterChip active={statusFilter === 'in_progress'} onClick={() => setStatusFilter('in_progress')}>In Progress</FilterChip>
            <FilterChip active={statusFilter === 'done'} onClick={() => setStatusFilter('done')}>Done</FilterChip>
          </div>
          <label className="inline-flex items-center gap-2 text-[11px] text-[#DBDEE1]">
            <input type="checkbox" className="accent-[#5865F2]" checked={clientOnly} onChange={(e) => setClientOnly(e.target.checked)} />
            Client-visible only
          </label>
          <button className="h-7 px-2 rounded border border-[#3F4147] bg-[#1E1F22] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">New List</button>
        </div>
      </div>

      {/* Pinned mini lists (post-it style) */}
      {pinned.length > 0 && (
        <div className="bg-[#16171A] border-b border-[#3F4147] px-3 sm:px-4 py-3">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-[#949BA4]">Pinned</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinned.map((l) => (
              <div key={l.id} className="relative rounded-[10px] shadow-sm border border-amber-300/50 bg-amber-200 text-[#111827] p-3 -rotate-[0.8deg]">
                <div className="text-xs font-semibold mb-1 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                  {l.title}
                </div>
                <ul className="space-y-1">
                  {(l.items || []).slice(0, 4).map((it) => (
                    <li key={it.id} className="flex items-start gap-2 text-[12px]">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full mt-1 ${
                        (it.status === 'done') ? 'bg-blue-500' : (it.status === 'in_progress') ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      <span className="truncate">{it.title}</span>
                    </li>
                  ))}
                  {(l.items || []).length === 0 && (
                    <li className="text-[12px] opacity-70">No items</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#16171A] divide-y divide-[#3F4147]">
        {filteredLists.map((l) => (
          <div key={l.id} className="p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(l.id)} className="text-[#DBDEE1] hover:text-white">
                  <span className="inline-block w-4">{collapsed[l.id] ? '▶' : '▼'}</span>
                </button>
                <span className="text-sm font-medium text-white">{l.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#232428] border border-[#3F4147] text-[#949BA4]">{l.items?.length || 0}</span>
                {pinnedListIds.includes(l.id) && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-amber-200 text-[#111827] border border-amber-300/70">Pinned</span>
                )}
              </div>
              <button className="h-7 px-2 rounded border border-[#3F4147] bg-[#1E1F22] text-xs text-[#DBDEE1] opacity-60 cursor-not-allowed">Add item</button>
            </div>
            {!collapsed[l.id] && (
              <ul className="space-y-2">
                {(l.items || []).map((it) => (
                  <li key={it.id} className="rounded-lg border border-[#3F4147] bg-[#0F1115] px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-white truncate">{it.title}</div>
                        <div className="mt-0.5 text-[11px] text-[#949BA4] flex items-center gap-3">
                          <span>Due {it.due_at ? new Date(it.due_at).toLocaleDateString() : '—'}</span>
                          <span className={it.is_client_visible ? 'text-[#9FEFBC]' : 'text-[#949BA4]'}>
                            {it.is_client_visible ? 'Client visible' : 'Private'}
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
                  <li className="text-[12px] text-[#949BA4]">No items.</li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded border text-[11px] ${
        active ? 'bg-[#232428] border-[#3F4147] text-[#DBDEE1]' : 'bg-transparent border-[#2a2b30] text-[#949BA4] hover:text-[#DBDEE1]'
      }`}
    >
      {children}
    </button>
  )
}
