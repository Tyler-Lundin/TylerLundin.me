"use client"
import React, { useMemo, useState } from 'react'
import type { HealthItemData, HealthStatus } from './HealthItem'
import HealthItem from './HealthItem'

type Props = {
  title?: string
  items?: HealthItemData[]
  children?: React.ReactNode
  onRun?: () => Promise<{ items: HealthItemData[]; ts?: number | string }>
  actions?: React.ReactNode
  autoRun?: boolean
}

export default function HealthTerminal({ title = 'Health Checks', items = [], children, onRun, actions, autoRun = false }: Props) {
  const [list, setList] = useState<HealthItemData[]>(items)
  const [running, setRunning] = useState(false)
  const [filter, setFilter] = useState<'all' | HealthStatus>('all')
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null)
  const [hasAutoRun, setHasAutoRun] = useState(false)

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
        setList(next.items)
        if (next.ts) {
          const d = typeof next.ts === 'number' ? new Date(next.ts) : new Date(next.ts)
          if (!isNaN(d.getTime())) setLastRunAt(d)
          else setLastRunAt(new Date())
        } else {
          setLastRunAt(new Date())
        }
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
        setLastRunAt(new Date())
      }
    } finally {
      setRunning(false)
    }
  }

  // Auto-run once on mount when requested and an onRun handler is present
  React.useEffect(() => {
    if (autoRun && onRun && !hasAutoRun) {
      setHasAutoRun(true)
      // Fire and forget
      handleRun()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun, onRun])

  return (
    <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm dark:border-[#3F4147] dark:bg-[#0F1115]">
      <div className="px-4 py-2.5 bg-neutral-50/50 border-b border-neutral-200 dark:bg-[#1E1F22] dark:border-[#3F4147]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900 dark:text-white">{title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-500 dark:bg-[#232428] dark:border-[#3F4147] dark:text-[#949BA4]">DEV</span>
          </div>
          <div className="flex items-center gap-2">
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500 dark:text-[#949BA4]">
              <SummaryDot color="bg-emerald-400" label={String(summary.ok)} />
              <SummaryDot color="bg-amber-400" label={String(summary.warn)} />
              <SummaryDot color="bg-rose-500" label={String(summary.error)} />
            </div>
            <button
              onClick={handleRun}
              className={`h-7 px-2 rounded border text-xs ${running ? 'bg-neutral-100 text-neutral-500 cursor-wait dark:bg-[#2a2b30] dark:text-[#949BA4]' : 'bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200 dark:bg-[#232428] dark:text-[#DBDEE1] dark:border-[#3F4147] dark:hover:bg-[#2a2b30]'}`}
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
          <div className="text-[10px] text-neutral-500 dark:text-[#949BA4]">
            {lastRunAt ? `Last run ${lastRunAt.toLocaleTimeString()}` : 'Not run yet'}
          </div>
        </div>
      </div>
      <ul className="bg-white dark:bg-[#0F1115]">
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
      className={`px-2 py-0.5 rounded border text-[11px] ${active ? 'bg-neutral-100 border-neutral-200 text-neutral-900 dark:bg-[#232428] dark:border-[#3F4147] dark:text-[#DBDEE1]' : 'bg-transparent border-neutral-200 text-neutral-500 hover:text-neutral-900 dark:border-[#2a2b30] dark:text-[#949BA4] dark:hover:text-[#DBDEE1]'}`}
    >
      {children}
    </button>
  )
}
