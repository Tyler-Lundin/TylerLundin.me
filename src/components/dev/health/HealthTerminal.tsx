"use client"
import React, { useMemo, useState } from 'react'
import type { HealthItemData, HealthStatus } from './HealthItem'
import HealthItem from './HealthItem'

type Props = {
  title?: string
  items?: HealthItemData[]
  children?: React.ReactNode
  onRun?: () => Promise<HealthItemData[]>
}

export default function HealthTerminal({ title = 'Health Checks', items = [], children, onRun }: Props) {
  const [list, setList] = useState<HealthItemData[]>(items)
  const [running, setRunning] = useState(false)
  const [filter, setFilter] = useState<'all' | HealthStatus>('all')
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null)

  const summary = useMemo(() => {
    const counters = { ok: 0, warn: 0, error: 0, pending: 0 }
    for (const it of list) counters[it.status as keyof typeof counters] = (counters[it.status as keyof typeof counters] || 0) + 1
    return counters
  }, [list])

  const filtered = useMemo(() => {
    return filter === 'all' ? list : list.filter((i) => i.status === filter)
  }, [list, filter])

  async function handleRun() {
    setRunning(true)
    try {
      if (onRun) {
        const next = await onRun()
        setList(next)
      } else {
        // Simulate a run locally: mark pending, then finalize with slightly tweaked timestamps
        const pendingList = list.map((i) => ({
          ...i,
          status: (i.status === 'error' ? 'error' : 'pending') as HealthStatus,
        }))
        setList(pendingList)
        await new Promise((r) => setTimeout(r, 700))
        const finalize = pendingList.map((i, idx) => ({
          ...i,
          status: (i.status === 'error' ? 'error' : (idx % 3 === 0 ? 'warn' : 'ok')) as HealthStatus,
          ts: new Date().toLocaleTimeString(),
        }))
        setList(finalize)
      }
      setLastRunAt(new Date())
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className="rounded-lg border border-[#3F4147] overflow-hidden">
      <div className="px-4 py-2.5 bg-[#1E1F22] border-b border-[#3F4147]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#232428] border border-[#3F4147] text-[#949BA4]">DEV</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#949BA4]">
              <SummaryDot color="bg-emerald-400" label={String(summary.ok)} />
              <SummaryDot color="bg-amber-400" label={String(summary.warn)} />
              <SummaryDot color="bg-rose-500" label={String(summary.error)} />
            </div>
            <button
              onClick={handleRun}
              className={`h-7 px-2 rounded border border-[#3F4147] text-xs ${running ? 'bg-[#2a2b30] text-[#949BA4] cursor-wait' : 'bg-[#232428] text-[#DBDEE1] hover:bg-[#2a2b30]'}`}
              disabled={running}
            >
              {running ? 'Running…' : 'Run checks'}
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px]">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
            <FilterChip active={filter === 'ok'} onClick={() => setFilter('ok')}>OK</FilterChip>
            <FilterChip active={filter === 'warn'} onClick={() => setFilter('warn')}>Warn</FilterChip>
            <FilterChip active={filter === 'error'} onClick={() => setFilter('error')}>Error</FilterChip>
            <FilterChip active={filter === 'pending'} onClick={() => setFilter('pending')}>Pending</FilterChip>
          </div>
          <div className="text-[10px] text-[#949BA4]">
            {lastRunAt ? `Last run ${lastRunAt.toLocaleTimeString()}` : 'Not run yet'}
          </div>
        </div>
      </div>
      <ul className="bg-[#0F1115]">
        {filtered.length > 0
          ? filtered.map((it) => <HealthItem key={it.id} item={it} />)
          : children || <li className="px-4 py-3 text-[12px] text-[#949BA4]">No checks yet.</li>}
      </ul>
    </section>
  )
}

function SummaryDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
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
