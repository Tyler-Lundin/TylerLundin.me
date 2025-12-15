"use client"
import { useEffect, useMemo, useState } from 'react'
import type { AnkrAnalysis } from '@/lib/ankr/config'

type ActionProposal = { name: string; args: any; confidence: number }

type Props = {
  actions: ActionProposal[]
  threadId?: string | null
  sourceMessageId?: string | null
  analysis?: AnkrAnalysis | null
  onRequested?: (created: { id: string; name: string; status: string }) => void
  onBatchCreated?: (created: { id: string; name: string; status: string }[]) => void
  disabled?: boolean
  onDevEvent?: (evt: any) => void
}

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function ActionChips({ actions, threadId, sourceMessageId, analysis, onRequested, onBatchCreated, disabled, onDevEvent }: Props) {
  const [state, setState] = useState<Record<string, Status>>({})
  const [err, setErr] = useState<string | null>(null)
  const [auto, setAuto] = useState<Set<string>>(new Set())
  const [autoLoading, setAutoLoading] = useState(false)
  const threshold = 0.75

  // Fetch automation suggestion (not executed), highlight chips
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!analysis || !actions?.length) { setAuto(new Set()); return }
      setAutoLoading(true)
      try {
        const res = await fetch('/api/ankr/automation/suggest', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ analysis, availableActions: actions.map(a => a.name) }),
        })
        if (!res.ok) throw new Error('auto suggest failed')
        const data = await res.json()
        if (cancelled) return
        setAuto(new Set<string>(data.autoActions || []))
      } catch {
        if (cancelled) return
        setAuto(new Set())
      } finally {
        if (!cancelled) setAutoLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [analysis, actions])

  const click = async (name: string) => {
    setErr(null)
    setState((s) => ({ ...s, [name]: 'loading' }))
    onDevEvent?.({ type: 'action_click', name, threadId, sourceMessageId })
    try {
      const baseArgs = (actions.find(a => a.name === name)?.args || {})
      const fixedArgs = normalizeClientArgs(name, baseArgs, analysis)
      onDevEvent?.({ type: 'action_click_args', name, baseArgs, fixedArgs, analysis })
      const res = await fetch('/api/ankr/actions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          threadId: threadId ?? null,
          sourceMessageId: sourceMessageId ?? null,
          requestedBy: 'assistant',
          actions: [
            { name, params: { ...fixedArgs, analysis: analysis ?? null } },
          ],
        }),
      })
      if (!res.ok) {
        let message = `HTTP ${res.status}`
        try {
          const data = await res.json()
          if (data?.error?.message) message = data.error.message
        } catch {}
        throw new Error(message)
      }
      const data = await res.json()
      const created = Array.isArray(data?.actions) ? data.actions[0] : null
      setState((s) => ({ ...s, [name]: 'done' }))
      if (created && onRequested) onRequested({ id: created.id, name, status: created.status })
      if (created) onDevEvent?.({ type: 'action_recorded', id: created.id, name, status: created.status })
    } catch (e: any) {
      setState((s) => ({ ...s, [name]: 'error' }))
      setErr(String(e?.message || 'Action failed'))
    }
  }

  const doItNow = async () => {
    setErr(null)
    const picks = (actions || []).filter(a => (a.confidence ?? 0) >= threshold)
    if (picks.length === 0) { setErr('No high-confidence actions available.'); return }
    try {
      // Record all at once
      onDevEvent?.({ type: 'do_it_now', picks: picks.map(p => ({ name: p.name, confidence: p.confidence, args: p.args })), threadId, sourceMessageId, analysis })
      const payload = {
        threadId: threadId ?? null,
        sourceMessageId: sourceMessageId ?? null,
        requestedBy: 'assistant',
        actions: picks.map(a => ({ name: a.name, params: { ...normalizeClientArgs(a.name, a.args || {}, analysis), analysis: analysis ?? null } })),
      }
      onDevEvent?.({ type: 'actions_payload', payload })
      const res = await fetch('/api/ankr/actions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`Record failed (HTTP ${res.status})`)
      const data = await res.json()
      const created = Array.isArray(data?.actions) ? data.actions : []
      onDevEvent?.({ type: 'actions_recorded', actions: created.map((c: any) => ({ id: c.id, name: c.action_name, status: c.status })) })
      for (let i = 0; i < created.length; i++) {
        const cr = created[i]
        // notify panel to add system message and start SSE/poll
        if (onRequested) onRequested({ id: cr.id, name: cr.action_name || picks[i]?.name, status: cr.status })
      }
      if (onBatchCreated) {
        const batch = created.map((cr: any, idx: number) => ({ id: cr.id, name: cr.action_name || picks[idx]?.name, status: cr.status }))
        onBatchCreated(batch)
      }
      // Kick off execution
      await Promise.all(created.map((cr: any) => fetch(`/api/ankr/actions/${cr.id}/execute`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ executor: 'dev' }) })))
      onDevEvent?.({ type: 'actions_execute_called', ids: created.map((c: any) => c.id) })
    } catch (e: any) {
      setErr(String(e?.message || 'Do it now failed'))
    }
  }

  if (!actions || actions.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-zinc-400">High-confidence actions are auto-selected (≥ {Math.round(threshold*100)}%).</div>
        <button
          type="button"
          onClick={doItNow}
          disabled={disabled}
          className="rounded-md border border-emerald-600 bg-emerald-500/90 px-2 py-0.5 text-[11px] font-medium text-zinc-900 hover:bg-emerald-400 disabled:opacity-60"
          title="Create and execute high-confidence actions"
        >
          Do it now
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((a) => (
          <button
            key={a.name}
            type="button"
            className={chipClass(state[a.name] || 'idle', auto.has(a.name))}
            onClick={() => click(a.name)}
            disabled={disabled || state[a.name] === 'loading' || state[a.name] === 'done'}
            title={state[a.name] === 'done' ? 'Recorded' : 'Record action request'}
          >
            <ChipDot status={state[a.name] || 'idle'} auto={auto.has(a.name)} />
            {a.name}
            <span className="ml-1 text-[9px] text-zinc-500 dark:text-zinc-400">{Math.round(a.confidence * 100)}%</span>
            {auto.has(a.name) && (
              <span className="ml-1 rounded px-1 text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">AUTO</span>
            )}
          </button>
        ))}
      </div>
      {err && <div className="text-[11px] text-red-300">{err}</div>}
    </div>
  )
}

function chipClass(st: Status, auto: boolean) {
  const base = 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]'
  if (st === 'loading') return `${base} border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-600/50 dark:bg-amber-500/10 dark:text-amber-200`
  if (st === 'done') return `${base} border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-200`
  if (st === 'error') return `${base} border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-600/10 dark:text-red-200`
  if (auto) return `${base} border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-600/10 dark:text-emerald-200 dark:hover:bg-emerald-600/15`
  return `${base} ankr-chip hover:bg-zinc-100 dark:hover:bg-zinc-800`
}

function ChipDot({ status, auto }: { status: Status; auto?: boolean }) {
  let cls = 'bg-zinc-500'
  if (status === 'loading') cls = 'bg-amber-500 animate-pulse dark:bg-amber-400'
  if (status === 'done') cls = 'bg-emerald-500 dark:bg-emerald-400'
  if (status === 'error') cls = 'bg-red-500 dark:bg-red-400'
  const ring = auto && status === 'idle' ? 'ring-1 ring-emerald-300 dark:ring-emerald-500/50' : ''
  return <span className={`h-1.5 w-1.5 rounded-full ${cls} ${ring}`} />
}

function normalizeClientArgs(name: string, args: Record<string, any>, analysis?: AnkrAnalysis | null) {
  const out = { ...(args || {}) }
  if (name === 'SaveNote') {
    if (!out.noteType) out.noteType = 'goal'
    if (!out.content) out.content = (analysis?.goal && String(analysis.goal)) || 'Captured goal'
  }
  if (name === 'CreateTopic') {
    if (!out.title && analysis?.goal) out.title = String(analysis.goal)
  }
  return out
}
