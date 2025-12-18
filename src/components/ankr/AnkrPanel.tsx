"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { TransparencyChips, type TransparencyInfo } from './TransparencyChips'
import ActionChips from './ActionChips'
import DevDrawer from './DevDrawer'
import { ANKR_CONFIG } from '@/lib/ankr/config'

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: number
  action?: { id: string; name: string; status: string }
}

export default function AnkrPanel({ onClose }: { onClose: () => void }) {
  const DEV_VIEW = String(process.env.NEXT_PUBLIC_ANKR_DEV_VIEW || '').toLowerCase() === 'true' || process.env.NEXT_PUBLIC_ANKR_DEV_VIEW === '1'
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "seed-1",
      role: "assistant",
      content: ANKR_CONFIG.persona.greeting,
      createdAt: Date.now(),
    },
  ])
  const [draft, setDraft] = useState("")
  const [mode, setMode] = useState<'idea' | 'action'>('action')
  const [sending, setSending] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [turnInfo, setTurnInfo] = useState<TransparencyInfo | null>(null)
  const [devLog, setDevLog] = useState<any[]>([])
  const [actionBatch, setActionBatch] = useState<null | { ids: string[]; names: Record<string,string>; results: Record<string, { status: string; info: any }> }>(null)
  const [devActions, setDevActions] = useState<any[]>([])
  const [devFilter, setDevFilter] = useState<'requested' | 'acknowledged' | 'running' | 'failed'>('requested')
  const [devOpen, setDevOpen] = useState(DEV_VIEW)
  const [sendLocked, setSendLocked] = useState(false)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
    }
  }, [])

  // Auto-resize textarea up to a max height (~4x)
  const maxComposerPx = 176 // ~4 x 44px
  const resizeComposer = () => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    const next = Math.min(el.scrollHeight, maxComposerPx)
    el.style.height = next + 'px'
  }

  useEffect(() => {
    resizeComposer()
  }, [draft])

  // Status chips: OFF / LOADING / ON for background steps
  type Status = 'OFF' | 'LOADING' | 'ON'
  const [status, setStatus] = useState<{ retrieval: Status; generation: Status; citations: Status }>({
    retrieval: 'OFF',
    generation: 'OFF',
    citations: 'OFF',
  })
  const [showStatusInfo, setShowStatusInfo] = useState(false)
  const statusInfoRef = useRef<HTMLDivElement | null>(null)
  const hintBtnRef = useRef<HTMLButtonElement | null>(null)
  const powerDownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const powerDown = () => {
    if (powerDownTimer.current) clearTimeout(powerDownTimer.current)
    powerDownTimer.current = setTimeout(() => {
      setStatus({ retrieval: 'OFF', generation: 'OFF', citations: 'OFF' })
    }, 1600)
  }

  // Close status info on outside click or Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!showStatusInfo) return
      const target = e.target as Node
      if (statusInfoRef.current?.contains(target)) return
      if (hintBtnRef.current?.contains(target)) return
      setShowStatusInfo(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowStatusInfo(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [showStatusInfo])

  // Prevent background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Focus the input on open
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Very light focus-trap
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const focusables = el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    el.addEventListener("keydown", handleKeyDown)
    return () => el.removeEventListener("keydown", handleKeyDown)
  }, [])

  const send = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    setStatus({ retrieval: 'LOADING', generation: 'LOADING', citations: 'OFF' })
    const userMsg: Message = {
      id: `m-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: Date.now(),
    }
    setMessages((m) => [...m, userMsg])
    setDraft("")

    // DEV: log request
    if (DEV_VIEW) setDevLog((log) => [...log, { ts: Date.now(), type: 'chat_request', body: { threadId, message: text } }])

    // Call chat API (Step 1 + Step 2)
    try {
      const res = await fetch("/api/ankr/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ threadId, message: text, mode }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const payload = await res.json()
      setThreadId(payload.threadId || threadId)
      setTurnInfo({
        analysis: null as any,
        recommendedActions: Array.isArray(payload?.plan?.recommendedActions) ? payload.plan.recommendedActions : [],
        citations: Array.isArray(payload?.plan?.citations) ? payload.plan.citations : [],
        retrievalPreview: [],
        telemetry: payload.telemetry,
        threadId: payload.threadId,
        sourceMessageId: undefined as any,
        decision: typeof payload?.plan?.decision === 'string' ? payload.plan.decision : null,
        retrievalDebug: undefined as any,
        // @ts-ignore dev-only debug fields
        contextDebug: payload.contextDebug,
        // @ts-ignore dev-only
        intentFlags: payload.intentFlags || (payload.intent && Array.isArray(payload.intent.flags) ? payload.intent.flags : undefined),
        // @ts-ignore dev-only
        intentSubjects: (payload.intent && Array.isArray(payload.intent.subjects)) ? payload.intent.subjects : undefined,
        // @ts-ignore dev-only
        messageAnalysis: payload.messageAnalysis,
      })
      if (DEV_VIEW) {
        const ts = Date.now()
        setDevLog((log) => [...log, { ts, type: 'chat_response', body: payload, mode }])
        const props = (payload?.messageAnalysis?.actionProposals || []) as Array<{ name: string; weight?: number; confidence?: number; args?: any }>
        if (props.length > 0) {
          const preview = props.map((p) => ({ name: p.name, weight: p.weight ?? p.confidence ?? 0, args: p.args || {} }))
          setDevLog((log) => [...log, { ts: ts+1, type: 'actions_params', actions: preview }])
        }
      }
      // Append assistant message from Step 2
      if (typeof payload?.assistantContent === 'string' && payload.assistantContent.trim().length > 0) {
        const a: Message = { id: `a-${Date.now()}`, role: 'assistant', content: personalityWrap(payload.assistantContent), createdAt: Date.now() }
        setMessages((m) => [...m, a])
      }
      // Reset status to OFF after response delivered
      setStatus({ retrieval: 'OFF', generation: 'OFF', citations: 'OFF' })
    } catch (e) {
      setStatus({ retrieval: 'OFF', generation: 'OFF', citations: 'OFF' })
      setTurnInfo(null)
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") {
      e.preventDefault()
      send()
    }
  }

  const isDevControls = process.env.NODE_ENV !== 'production'

  const ackAction = async (id: string, name: string) => {
    try {
      await fetch(`/api/ankr/actions/${id}/ack`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ acknowledgedBy: 'dev' }) })
      setMessages((m) => m.map((mm) => (mm.action?.id === id ? { ...mm, content: `Action requested: ${name} — status: acknowledged`, action: { id, name, status: 'acknowledged' } } : mm)))
    } catch {}
  }

  const completeAction = async (id: string, name: string, status: 'succeeded' | 'failed' | 'cancelled') => {
    try {
      await fetch(`/api/ankr/actions/${id}/complete`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status, executedBy: 'dev' }) })
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
        pollTimeoutRef.current = null
      }
      setMessages((m) => m.map((mm) => (mm.action?.id === id ? { ...mm, content: `Action requested: ${name} — status: ${status}`, action: { id, name, status } } : mm)))
      setSendLocked(false)
      const follow: Message = { id: `a-${Date.now()}`, role: 'assistant', content: personalityWrap(formatActionResult(name, status, undefined)), createdAt: Date.now() }
      setMessages((m) => [...m, follow])
    } catch {}
  }

  const handleReset = async () => {
    if (!DEV_VIEW) return
    const sure = typeof window !== 'undefined' ? window.confirm('This will delete ALL Ankr data (threads, messages, notes, snippets, actions). Type OK to proceed.') : false
    if (!sure) return
    try {
      const res = await fetch('/api/ankr/dev/reset', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ confirm: 'RESET' }) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setDevLog((log) => [...log, { ts: Date.now(), type: 'dev_reset', result: data }])
      // Reset local UI state
      setThreadId(null)
      setTurnInfo(null)
      setMessages([{ id: 'seed-1', role: 'assistant', content: ANKR_CONFIG.persona.greeting, createdAt: Date.now() }])
      const note: Message = { id: `sys-${Date.now()}`, role: 'system', content: 'Developer: Reset complete', createdAt: Date.now() }
      setMessages((m) => [...m, note])
    } catch (e: any) {
      setDevLog((log) => [...log, { ts: Date.now(), type: 'dev_reset_error', error: String(e?.message || e) }])
      const note: Message = { id: `sys-${Date.now()}`, role: 'system', content: `Developer: Reset failed — ${String((e as any)?.message || e)}`, createdAt: Date.now() }
      setMessages((m) => [...m, note])
    }
  }

  const loadDevActions = async (status: 'requested' | 'acknowledged' | 'running' | 'failed' = devFilter) => {
    if (!DEV_VIEW) return
    try {
      const res = await fetch(`/api/ankr/dev/actions?status=${status}&limit=50`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setDevActions(Array.isArray(data?.actions) ? data.actions : [])
      setDevFilter(status)
      setDevLog((log) => [...log, { ts: Date.now(), type: 'dev_actions_loaded', status, count: (data?.actions || []).length }])
    } catch (e: any) {
      setDevLog((log) => [...log, { ts: Date.now(), type: 'dev_actions_error', status, error: String(e?.message || e) }])
    }
  }

  const executeAction = async (id: string, force?: boolean) => {
    try {
      setDevLog((log) => [...log, { ts: Date.now(), type: 'dev_action_execute', id }])
      const res = await fetch(`/api/ankr/actions/${id}/execute`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ executor: 'dev', force: !!force }) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json().catch(() => null)
      const row = data?.action
      setDevLog((log) => [...log, { ts: Date.now(), type: 'dev_action_result', id, status: row?.status, status_info: row?.status_info }])
      // Reflect in chat as a system message and follow-up assistant note
      if (row) {
        const sys: Message = { id: `dev-${row.id}`, role: 'system', content: `Developer executed: ${row.action_name} — status: ${row.status}`, createdAt: Date.now(), action: { id: row.id, name: row.action_name, status: row.status } }
        setMessages((m) => [...m, sys])
        if (['succeeded','failed','cancelled'].includes(row.status)) {
          const follow: Message = { id: `a-${Date.now()}`, role: 'assistant', content: personalityWrap(formatActionResult(row.action_name, row.status, row.status_info)), createdAt: Date.now() }
          setMessages((m) => [...m, follow])
        }
      }
      await loadDevActions(devFilter)
    } catch (e: any) {
      setDevLog((log) => [...log, { ts: Date.now(), type: 'dev_action_execute_error', id, error: String(e?.message || e) }])
      const note: Message = { id: `dev-err-${Date.now()}`, role: 'system', content: `Developer: Execute failed — ${String(e?.message || e)}`, createdAt: Date.now() }
      setMessages((m) => [...m, note])
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ankr Menu"
      className="fixed inset-0 z-[60] flex h-full w-full flex-col bg-zinc-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative mx-auto my-6 flex h-[92vh] w-[min(1100px,94vw)] flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{ANKR_CONFIG.persona.name} — {ANKR_CONFIG.persona.tagline}</h2>
            <kbd className="ml-3 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">Cmd/Ctrl+J</kbd>
          </div>
          <div className="flex items-center gap-2">
            {DEV_VIEW && (
              <span title={turnInfo?.threadId || threadId || ''} className="hidden sm:inline-flex items-center gap-1 rounded-md border ankr-section-border bg-white dark:bg-zinc-900 px-1.5 py-0.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                <span className="opacity-70">Thread:</span>
                <code className="font-mono text-[10px]">
                  {(turnInfo?.threadId || threadId || '—').slice(0, 10)}{(turnInfo?.threadId || threadId)?.length! > 10 ? '…' : ''}
                </code>
              </span>
            )}
            {DEV_VIEW && <DevMenu onReset={handleReset} />}
            {DEV_VIEW && (
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                onClick={() => setDevOpen((v) => !v)}
              >
                {devOpen ? 'Hide Dev' : 'Show Dev'}
              </button>
            )}
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onClick={onClose}
              aria-label="Close Ankr"
            >
              Esc
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`relative min-h-0 flex-1 flex flex-col transition-[padding] duration-300 ${devOpen ? 'lg:pr-[380px]' : 'lg:pr-0'}`}>
          {!DEV_VIEW && (
            <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs">
              <Chip>+ Attach Topic</Chip>
              <Chip variant="active">Projects</Chip>
              <Chip>Features</Chip>
              <Chip>SEO</Chip>
            </div>
          )}
          {/* Mode Toggle */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 text-[11px]">
            <div className="text-zinc-500 dark:text-zinc-300">Mode</div>
            <div className="inline-flex items-center rounded-md border ankr-section-border overflow-hidden">
              <button
                type="button"
                className={`px-2 py-0.5 ${mode === 'idea' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-600/20 dark:text-emerald-200' : 'text-zinc-600 dark:text-zinc-300'}`}
                onClick={() => setMode('idea')}
                aria-pressed={mode === 'idea'}
              >
                Ideas
              </button>
              <button
                type="button"
                className={`px-2 py-0.5 border-l ankr-section-border ${mode === 'action' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-600/20 dark:text-emerald-200' : 'text-zinc-600 dark:text-zinc-300'}`}
                onClick={() => setMode('action')}
                aria-pressed={mode === 'action'}
              >
                Actions
              </button>
            </div>
          </div>

          {/* Status chips */}
          {!DEV_VIEW && (<div className="relative flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 text-[11px] text-zinc-600 dark:text-zinc-300">
            <StatusChips status={status} />
            <button
              ref={hintBtnRef}
              type="button"
              aria-label="Show status help"
              aria-haspopup="dialog"
              aria-expanded={showStatusInfo}
              onClick={() => setShowStatusInfo((v) => !v)}
              className="inline-flex items-center rounded-md border ankr-section-border bg-white dark:bg-zinc-950 px-1.5 py-0.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <HintIcon className="h-3.5 w-3.5" />
            </button>

            {showStatusInfo && (
              <div
                ref={statusInfoRef}
                role="dialog"
                aria-label="Ankr status help"
                className="ankr-popover absolute right-3 top-[calc(100%+8px)] z-20 w-[min(420px,92vw)] rounded-lg border p-3 text-[12px] shadow-2xl"
              >
                <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">What these mean</div>
                <ul className="space-y-1 text-zinc-200">
                  <li>
                    <strong className="text-zinc-100">Retrieval:</strong> Finds relevant snippets by topic, facets, weight, and recency (embeddings later).
                  </li>
                  <li>
                    <strong className="text-zinc-100">Generation:</strong> Drafts a reply using retrieved context and thread state.
                  </li>
                  <li>
                    <strong className="text-zinc-100">Citations:</strong> References to the snippets used in the reply for traceability.
                  </li>
                </ul>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-1.5 py-0.5"><span className="h-2 w-2 rounded-full bg-zinc-600" /> OFF</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-600/50 bg-amber-500/10 px-1.5 py-0.5 text-amber-200"><span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> LOADING</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-700 bg-emerald-600/20 px-1.5 py-0.5 text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-400" /> ON</span>
                </div>
              </div>
            )}
          </div>)}

          {/* Transparency chips */}
          {!DEV_VIEW && (
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-3 py-2">
              <TransparencyChips info={turnInfo} />
            </div>
          )}

          {/* Recommended actions (clickable chips) */}
          {!DEV_VIEW && turnInfo?.recommendedActions && turnInfo.recommendedActions.length > 0 && (
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-3 py-2">
              <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Recommended Actions</div>
              <ActionChips
                actions={turnInfo.recommendedActions}
                threadId={turnInfo.threadId}
                sourceMessageId={turnInfo.sourceMessageId}
                analysis={turnInfo.analysis as any}
                disabled={sendLocked}
                onRequested={(created) => {
                  // Add special system message and start polling for completion
                  const msg: Message = {
                    id: `action-${created.id}`,
                    role: 'system',
                    content: `Action requested: ${created.name} — status: ${created.status}`,
                    createdAt: Date.now(),
                    action: created,
                  }
                  setMessages((m) => [...m, msg])
                  // Do not lock send until action actually runs
                  // Prefer SSE stream, fallback to bounded polling
                  let usingSSE = false
                  try {
                    const es = new EventSource(`/api/ankr/actions/${created.id}/stream`)
                    usingSSE = true
                    let ended = false
                    es.onmessage = (evt) => {
                      const data = JSON.parse(evt.data)
                      if (data?.status) {
                        setMessages((m) => m.map((mm) => mm.id === msg.id ? { ...mm, content: `Action requested: ${created.name} — status: ${data.status}`, action: { ...created, status: data.status } } : mm))
                        // Lock only when running; unlock otherwise
                        if (data.status === 'running') setSendLocked(true)
                        else setSendLocked(false)
                        if (actionBatch && actionBatch.ids.includes(created.id)) {
                          setActionBatch((b) => {
                            if (!b) return b
                            const next = { ...b.results, [created.id]: { status: data.status, info: data?.status_info } }
                            const done = b.ids.every((id) => ['succeeded','failed','cancelled'].includes((next[id]?.status)||'requested'))
                            if (done) {
                              const summary = composeBatchSummary(b.ids, b.names, next)
                              const follow: Message = { id: `a-${Date.now()}`, role: 'assistant', content: summary, createdAt: Date.now() }
                              setMessages((m) => [...m, follow])
                              return null
                            }
                            return { ...b, results: next }
                          })
                        }
                        if (['succeeded','failed','cancelled'].includes(data.status)) {
                          ended = true
                          es.close()
                          setSendLocked(false)
                          const detail = formatActionResult(created.name, data.status, data?.status_info)
                          const follow: Message = { id: `a-${Date.now()}`, role: 'assistant', content: personalityWrap(detail), createdAt: Date.now() }
                          setMessages((m) => [...m, follow])
                        }
                      }
                    }
                    es.addEventListener('end', (evt: MessageEvent) => {
                      try { es.close() } catch {}
                      if (!ended) {
                        setSendLocked(false)
                        setMessages((m) => m.map((mm) => mm.id === msg.id ? { ...mm, content: `Action requested: ${created.name} — status: requested (timed out)`, action: { ...created, status: 'requested' } } : mm))
                      }
                    })
                    es.onerror = () => {
                      try { es.close() } catch {}
                      // fall back to polling below
                      usingSSE = false
                    }
                  } catch {
                    usingSSE = false
                  }
                  if (!usingSSE) {
                    const delays = [800, 1000, 1200, 1500, 1800, 2200, 2600, 3000, 3500, 4000]
                    let attempt = 0
                    const poll = async () => {
                      try {
                        const res = await fetch(`/api/ankr/actions/${created.id}`)
                        if (res.ok) {
                          const data = await res.json()
                          const status: string = data?.action?.status || 'requested'
                          setMessages((m) => m.map((mm) => mm.id === msg.id ? { ...mm, content: `Action requested: ${created.name} — status: ${status}`, action: { ...created, status } } : mm))
                          if (status === 'running') setSendLocked(true)
                          else setSendLocked(false)
                          if (['succeeded','failed','cancelled'].includes(status)) {
                            setSendLocked(false)
                            const follow: Message = { id: `a-${Date.now()}`, role: 'assistant', content: personalityWrap(formatActionResult(created.name, status, data?.action?.status_info)), createdAt: Date.now() }
                            setMessages((m) => [...m, follow])
                            if (actionBatch && actionBatch.ids.includes(created.id)) {
                              setActionBatch((b) => {
                                if (!b) return b
                                const next = { ...b.results, [created.id]: { status, info: data?.action?.status_info } }
                                const done = b.ids.every((id) => ['succeeded','failed','cancelled'].includes((next[id]?.status)||'requested'))
                                if (done) {
                                  const summary = composeBatchSummary(b.ids, b.names, next)
                                  const follow2: Message = { id: `a-${Date.now()}`, role: 'assistant', content: summary, createdAt: Date.now() }
                                  setMessages((m) => [...m, follow2])
                                  return null
                                }
                                return { ...b, results: next }
                              })
                            }
                            return
                          }
                        }
                      } catch {}
                      attempt += 1
                      if (attempt >= 10) {
                        setSendLocked(false)
                        setMessages((m) => m.map((mm) => mm.id === msg.id ? { ...mm, content: `Action requested: ${created.name} — status: requested (timed out)`, action: { ...created, status: 'requested' } } : mm))
                        const follow: Message = { id: `a-${Date.now()}`, role: 'assistant', content: personalityWrap(`I waited for ${created.name} but it hasn’t completed yet. You can complete it later and I’ll pick it up next turn.`), createdAt: Date.now() }
                        setMessages((m) => [...m, follow])
                        return
                      }
                      const d = delays[Math.min(attempt, delays.length - 1)]
                      pollTimeoutRef.current = setTimeout(poll, d)
                    }
                    pollTimeoutRef.current = setTimeout(poll, 1200)
                  }
                }}
                onBatchCreated={(created) => {
                  const names: Record<string,string> = {}
                  const ids: string[] = []
                  for (const c of created) { names[c.id] = c.name; ids.push(c.id) }
                  setActionBatch({ ids, names, results: {} })
                  if (DEV_VIEW) setDevLog((log) => [...log, { ts: Date.now(), type: 'batch_created', ids }])
                }}
                onDevEvent={(evt) => { if (DEV_VIEW) setDevLog((log) => [...log, { ts: Date.now(), ...evt }]) }}
              />
            </div>
          )}

          {/* Messages */}
          <MessageList
            messages={messages}
            devControls={isDevControls}
            onAck={(id, name) => ackAction(id, name)}
            onComplete={(id, name, status) => completeAction(id, name, status)}
          />

          {/* Composer */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3">
              <div className="flex items-end gap-2">
                <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask for ideas, improvements, or references…"
                rows={1}
                  className="min-h-[44px] w-full resize-none rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none focus:ring-2 focus:ring-emerald-500 overflow-y-auto"
                  style={{ maxHeight: maxComposerPx }}
                  onInput={resizeComposer}
                />
              <button
                type="button"
                onClick={send}
                disabled={!draft.trim() || sending || sendLocked}
                className="inline-flex h-[44px] shrink-0 items-center justify-center rounded-lg border border-emerald-600 bg-emerald-500 px-3 text-sm font-medium text-zinc-900 dark:text-black shadow hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendLocked ? 'Action running…' : 'Send'}
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
              <span>Enter = new line • Cmd/Ctrl+Enter = send</span>
              <span>Notes, citations, and saves appear here</span>
            </div>
          </div>
        </div>
        {DEV_VIEW && (
          <DevDrawer
            devOpen={devOpen}
            status={status}
            turnInfo={turnInfo}
            sendLocked={sendLocked}
            actionBatch={actionBatch}
            setActionBatch={setActionBatch}
            setMessages={setMessages}
            setDevLog={setDevLog}
            devLog={devLog}
            DEV_VIEW={DEV_VIEW}
            pollTimeoutRef={pollTimeoutRef}
            hintBtnRef={hintBtnRef}
            statusInfoRef={statusInfoRef}
            showStatusInfo={showStatusInfo}
            setShowStatusInfo={setShowStatusInfo}
            loadDevActions={loadDevActions}
            devFilter={devFilter}
            devActions={devActions}
            executeAction={executeAction}
            setSendLocked={setSendLocked}
          />
        )}
      </div>
    </div>
  )
}

function MessageList({ messages, devControls, onAck, onComplete }: { messages: Message[]; devControls?: boolean; onAck?: (id: string, name: string) => void; onComplete?: (id: string, name: string, status: 'succeeded' | 'failed' | 'cancelled') => void }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
      {messages.map((m) => (
        <div key={m.id} className="flex">
          {m.role === 'assistant' ? (
            <div className="ml-0 max-w-[80%] whitespace-pre-wrap rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100">{m.content}</div>
          ) : m.role === 'user' ? (
            <div className="ml-auto max-w-[80%] whitespace-pre-wrap rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-600/20 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-100">{m.content}</div>
          ) : (
            <div className="mx-auto max-w-[90%] whitespace-pre-wrap rounded-md border border-amber-300 dark:border-amber-600/50 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 text-xs text-amber-900 dark:text-amber-100">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="mr-2 rounded px-1 py-0.5 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">Action</span>
                  {m.content}
                </div>
                {devControls && m.action && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded border px-1.5 py-0.5 text-[10px] border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-600/50 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
                      onClick={() => onAck && onAck(m.action!.id, m.action!.name)}
                    >
                      Ack
                    </button>
                    <select
                      className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-200"
                      onChange={(e) => {
                        const v = e.target.value as 'succeeded' | 'failed' | 'cancelled'
                        if (v && onComplete) onComplete(m.action!.id, m.action!.name, v)
                        e.currentTarget.selectedIndex = 0
                      }}
                    >
                      <option value="">Complete…</option>
                      <option value="succeeded">Succeeded</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Chip({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "active" }) {
  const base = "inline-flex items-center rounded-full border px-2 py-0.5"
  if (variant === "active") {
    // Light mode: stronger contrast; Dark mode: subtle emerald tint
    const cls = "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-200"
    return <span className={`${base} ${cls}`}>{children}</span>
  }
  // Default chip uses theme-aware chip style
  return <span className={`${base} ankr-chip`}>{children}</span>
}

function synthesizeSuggestion(text: string): string {
  // Very simple UX placeholder to evoke helpfulness without backend
  const ideas = [
    `Got it. Want me to tag this under a topic and draft next steps?`,
    `I can reference related snippets or scan the repo section if helpful.`,
    `Consider splitting into 2–3 actionable tasks; I can stage them.`,
    `Shall I start a thread titled "${truncate(text, 32)}" and pin relevant topics?`,
  ]
  return ideas[Math.floor(Math.random() * ideas.length)]
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s
}

function personalityWrap(s: string): string {
  // Keep content as-is; avoid dead config fields
  const trimmed = s.trim()
  return trimmed || 'I’ll keep things tidy and referenced.'
}

function StatusChips({ status }: { status: { retrieval: 'OFF' | 'LOADING' | 'ON'; generation: 'OFF' | 'LOADING' | 'ON'; citations: 'OFF' | 'LOADING' | 'ON' } }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusChip label="Retrieval" state={status.retrieval} />
      <StatusChip label="Generation" state={status.generation} />
      <StatusChip label="Citations" state={status.citations} />
    </div>
  )
}

function StatusChip({ label, state }: { label: string; state: 'OFF' | 'LOADING' | 'ON' }) {
  const base = 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5'
  // Default (OFF) theme-aware
  let cls = 'border-zinc-300 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
  let dot = 'bg-zinc-500'
  if (state === 'LOADING') {
    cls = 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-600/50 dark:bg-amber-500/10 dark:text-amber-200'
    dot = 'bg-amber-500 animate-pulse dark:bg-amber-400'
  } else if (state === 'ON') {
    cls = 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-200'
    dot = 'bg-emerald-500 dark:bg-emerald-400'
  }
  return (
    <span className={`${base} ${cls}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      <span>{label}</span>
      <span className="ml-1 text-[10px] opacity-70">{state}</span>
    </span>
  )
}

function HintIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" fill="currentColor" fillOpacity="0.06"/>
      <path d="M10.75 10.25a1.25 1.25 0 1 1 2.5 0c0 .69-.56 1.25-1.25 1.25m0 0v1.25m0-6a3.5 3.5 0 0 0-3.5 3.5c0 .98.43 1.86 1.12 2.47.4.36.63.88.63 1.42v.11h3.5v-.11c0-.54.23-1.06.63-1.42A3.49 3.49 0 0 0 14.5 10c0-1.93-1.57-3.5-3.5-3.5Zm0 11.25h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function DevMenu({ onReset }: { onReset: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        title="Developer actions"
      >
        <KebabIcon className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 text-[12px] text-zinc-700 dark:text-zinc-200 shadow-xl">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
            onClick={() => { setOpen(false); onReset() }}
          >
            RESET ANKR DATA
            <span className="ml-2 rounded border border-red-300 px-1 text-[10px] text-red-700 dark:border-red-600/50 dark:text-red-300">Danger</span>
          </button>
        </div>
      )}
    </div>
  )
}

function KebabIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M12 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor" />
    </svg>
  )
}

function composeBatchSummary(ids: string[], names: Record<string,string>, results: Record<string, { status: string; info: any }>): string {
  const parts: string[] = []
  const lines: string[] = []
  for (const id of ids) {
    const name = names[id] || 'Action'
    const r = results[id]
    if (!r) continue
    const detail = formatActionResult(name, r.status, r.info)
    lines.push(`- ${detail}`)
  }
  parts.push('Summary of executed actions:')
  parts.push(...lines)
  parts.push('If you want to iterate, tell me what to adjust or run again.')
  return parts.join('\n')
}

function formatActionResult(actionName: string, status: string, info?: any): string {
  const name = actionName || 'Action'
  const s = (status || '').toLowerCase()
  const detail = typeof info === 'string' ? info : (info?.message || info?.error || '')
  if (s === 'succeeded') return `${name}: completed successfully.${detail ? ` ${detail}` : ''}`
  if (s === 'failed') return `${name}: failed.${detail ? ` ${detail}` : ''}`
  if (s === 'cancelled') return `${name}: cancelled.${detail ? ` ${detail}` : ''}`
  if (s === 'acknowledged') return `${name}: acknowledged.`
  if (s === 'running') return `${name}: running…`
  return `${name}: ${status || 'updated'}.`
}

// DevDrawer, StepList, and DevLogs moved to ./DevDrawer for clarity
