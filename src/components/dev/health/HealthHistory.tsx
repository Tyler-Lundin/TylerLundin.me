"use client"

import React, { useEffect, useMemo, useState } from 'react'
import HealthItem from './HealthItem'

type Run = {
  id: string
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  overall_status: 'ok' | 'warn' | 'error' | 'pending'
  error: string | null
}

type RunDetail = Run & {
  items: { id: string; label: string; status: 'ok'|'warn'|'error'|'pending'; detail?: string; link?: string; ts?: string }[]
  endpoint_url: string | null
}

function StatusPill({ s }: { s: Run['overall_status'] }) {
  const map: Record<string, string> = {
    ok: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#0E2A3A] dark:text-[#93C5FD] dark:border-[#0B364A]',
    warn: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#3A2A0E] dark:text-[#FDE68A] dark:border-[#4A360B]',
    error: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#3A0E0E] dark:text-[#FCA5A5] dark:border-[#4A0B0B]',
    pending: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-[#2B2C30] dark:text-[#949BA4] dark:border-[#3F4147]',
  }
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium border capitalize ${map[s]}`}>{s}</span>
}

export default function HealthHistory({ projectId, limit = 10, viewAllHref }: { projectId: string; limit?: number; viewAllHref?: string }) {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/dev/projects/${projectId}/health/history?limit=${limit}`, { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load history')
        if (!cancelled) setRuns(json as Run[])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load history')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [projectId, limit])

  const rows = useMemo(() => runs.map(r => ({
    id: r.id,
    started: new Date(r.started_at),
    duration: r.duration_ms ?? 0,
    status: r.overall_status,
    error: r.error,
  })), [runs])

  return (
    <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm dark:border-[#3F4147] dark:bg-[#0F1115]">
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50 dark:border-[#3F4147] dark:bg-[#1E1F22]">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Health History</h2>
          <div className="flex items-center gap-3">
            <div className="text-[10px] text-neutral-500 dark:text-[#949BA4]">Last {limit} runs</div>
            {viewAllHref ? (
              <a href={viewAllHref} className="text-[10px] font-medium text-blue-600 hover:underline dark:text-blue-400">View all</a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="divide-y divide-neutral-100 dark:divide-[#232428]">
        {loading ? (
          <div className="px-5 py-6 text-sm text-neutral-500">Loading…</div>
        ) : error ? (
          <div className="px-5 py-6 text-sm text-rose-600 dark:text-rose-400">{error}</div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-6 text-sm text-neutral-500">No history yet.</div>
        ) : (
          rows.map(r => (
            <RunRow key={r.id} projectId={projectId} row={r} />
          ))
        )}
      </div>
    </section>
  )
}

function RunRow({ projectId, row }: { projectId: string; row: { id: string; started: Date; duration: number; status: Run['overall_status']; error: string | null } }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<RunDetail | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const toggle = async () => {
    if (open) { setOpen(false); return }
    setOpen(true)
    if (detail || loading) return
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch(`/api/dev/projects/${projectId}/health/history/${row.id}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load run')
      setDetail(json as RunDetail)
    } catch (e: any) {
      setErr(e?.message || 'Failed to load run')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-b border-neutral-100 last:border-none dark:border-[#232428]">
      <button onClick={toggle} className="w-full px-5 py-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#0F1115]">
        <div className="flex items-center gap-3">
          <StatusPill s={row.status} />
          <div className="text-sm text-neutral-900 dark:text-neutral-100">{row.started.toLocaleString()}</div>
        </div>
        <div className="text-xs text-neutral-500 dark:text-[#949BA4] flex items-center gap-3">
          <span>{row.duration} ms</span>
          {row.error ? <span className="text-rose-600 dark:text-rose-400">{row.error}</span> : null}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4">
          {loading ? (
            <div className="text-sm text-neutral-500">Loading…</div>
          ) : err ? (
            <div className="text-sm text-rose-600 dark:text-rose-400">{err}</div>
          ) : detail ? (
            <div>
              <div className="mb-2 text-[11px] text-neutral-500 dark:text-[#949BA4]">
                Endpoint: <span className="font-mono">{detail.endpoint_url || '—'}</span>
              </div>
              <ul className="rounded-lg border border-neutral-200 bg-white dark:border-[#3F4147] dark:bg-[#0F1115]">
                {detail.items.map((it) => (
                  <HealthItem key={it.id} item={it} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
