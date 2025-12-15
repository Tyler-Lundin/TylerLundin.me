"use client"
import { useEffect, useRef, useState } from 'react'

export type TransparencyInfo = {
  analysis?: { category: string; goal: string; relatedTo: string[]; confidence?: number }
  recommendedActions?: { name: string; args: any; confidence: number }[]
  citations?: { id: string; locator?: string }[]
  retrievalPreview?: { id: string; source: string | null; excerpt: string }[]
  telemetry?: { candidatesCount?: number; topSource?: string | null; model?: string; totalMs?: number }
  threadId?: string | null
  sourceMessageId?: string | null
  decision?: string | null
  retrievalDebug?: {
    matchedTopics: { id: string; title: string; slug: string }[]
    pinnedTopicIds: string[]
    pinnedTopicNames?: string[]
    combinedTopicIds: string[]
  }
}

export function TransparencyChips({ info }: { info: TransparencyInfo | null }) {
  const [open, setOpen] = useState<string | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return
      const t = e.target as Node
      if (popRef.current?.contains(t)) return
      setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (!info) return null
  const chip = (key: string, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setOpen(open === key ? null : key)}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${open === key ? 'ankr-chip' : 'ankr-chip'} hover:bg-zinc-100 dark:hover:bg-zinc-800`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
      {label}
    </button>
  )

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        {chip('analysis', 'Analysis')}
        {chip('retrieval', 'Retrieval')}
        {chip('citations', 'Citations')}
        {chip('actions', 'Actions')}
        {chip('decision', 'Decision')}
        {chip('model', 'Model')}
      </div>
      {open && (
        <div ref={popRef} className="ankr-popover absolute right-0 top-[calc(100%+8px)] z-20 w-[min(520px,92vw)] rounded-lg border p-3 text-[12px] text-zinc-700 dark:text-zinc-200 shadow-2xl">
          {open === 'analysis' && (
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Analyzed Message</div>
              <div><strong>Category:</strong> {info.analysis?.category || '—'}</div>
              <div className="mt-1"><strong>Goal:</strong> {info.analysis?.goal || '—'}</div>
              <div className="mt-1"><strong>RelatedTo:</strong> {(info.analysis?.relatedTo || []).join(', ') || '—'}</div>
              {typeof info.analysis?.confidence === 'number' && <div className="mt-1"><strong>Confidence:</strong> {Math.round((info.analysis?.confidence || 0)*100)}%</div>}
            </div>
          )}
          {open === 'retrieval' && (
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Retrieval Summary</div>
              <div><strong>Candidates:</strong> {info.telemetry?.candidatesCount ?? 0}</div>
              <div><strong>Top Source:</strong> {info.telemetry?.topSource || '—'}</div>
              <div className="mt-2 space-y-1">
                {(info.retrievalPreview || []).map((r) => (
                  <div key={r.id} className="rounded-md border border-zinc-800 bg-zinc-950/50 p-2 text-[11px] text-zinc-300">
                    <div className="mb-0.5 text-zinc-400">{r.source || 'snippet'}</div>
                    <div className="line-clamp-3 whitespace-pre-wrap">{r.excerpt}</div>
                  </div>
                ))}
                {(!info.retrievalPreview || info.retrievalPreview.length === 0) && <div className="text-zinc-400">No preview available.</div>}
              </div>
            </div>
          )}
          {open === 'citations' && (
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Citations</div>
              <div className="text-zinc-300">{(info.citations || []).length} referenced snippet(s).</div>
              {(info.citations || []).length > 0 && (
                <div className="mt-1 text-[11px] text-zinc-400">IDs: {(info.citations || []).slice(0, 6).map(c => c.id).join(', ')}{(info.citations || []).length > 6 ? '…' : ''}</div>
              )}
            </div>
          )}
          {open === 'actions' && (
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Recommended Actions</div>
              <ul className="list-disc pl-5 text-zinc-200">
                {(info.recommendedActions || []).map((a) => (
                  <li key={a.name} className="py-0.5">{a.name} <span className="text-[10px] text-zinc-400">({Math.round((a.confidence ?? 0)*100)}%)</span></li>
                ))}
                {(info.recommendedActions || []).length === 0 && <li className="list-none text-zinc-400">(none)</li>}
              </ul>
              <div className="mt-2 text-[11px] text-zinc-400">Actions are suggestions only; execution requires explicit approval.</div>
            </div>
          )}
          {open === 'decision' && (
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Recommended Decision</div>
              <div className="text-zinc-200 whitespace-pre-wrap">{info.decision || '—'}</div>
            </div>
          )}
          {open === 'model' && (
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Model & Timing</div>
              <div><strong>Model:</strong> {info.telemetry?.model || 'synth'}</div>
              <div><strong>Time:</strong> {typeof info.telemetry?.totalMs === 'number' ? `${info.telemetry?.totalMs}ms` : '—'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
