"use client"

import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { savePostAction } from '@/app/dev/actions/blog'
import type { WizardState } from './types'
import { useActivity } from './activity/ActivityContext'

export default function Step5Finalize({ state }: { state: WizardState }) {
  const { start, complete, fail } = useActivity()
  const [refineOpen, setRefineOpen] = useState(false)
  const [changes, setChanges] = useState<any[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const d = state.draft || {}

  const appliedDraft = useMemo(() => {
    let next: any = { ...d, tags: Array.isArray(d.tags) ? [...d.tags] : [] }
    for (const ch of changes) {
      if (!selected[ch.id]) continue
      if (ch.field === 'title') next.title = ch.after
      else if (ch.field === 'excerpt') next.excerpt = ch.after
      else if (ch.field === 'tags') next.tags = ch.after
      else if (ch.field === 'content_md' && ch.before_snippet && ch.after_snippet) {
        const before = String(next.content_md || '')
        if (before.includes(ch.before_snippet)) {
          next = { ...next, content_md: before.replace(ch.before_snippet, ch.after_snippet) }
        }
      }
    }
    return next
  }, [changes, selected, d])

  const toggleAll = (value: boolean) => {
    const out: Record<string, boolean> = {}
    for (const ch of changes) out[ch.id] = value
    setSelected(out)
  }

  const openRefine = async () => {
    const actId = start('Refining draft…')
    try {
      const res = await fetch('/api/dev/blog/refine-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: d, context: { goal: state.goals, anchors: state.keywords } }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to refine draft')
      const list = Array.isArray(json.changes) ? json.changes : []
      const sel: Record<string, boolean> = {}
      for (const ch of list) sel[ch.id] = true
      setChanges(list)
      setSelected(sel)
      setRefineOpen(true)
      complete(actId, 'Refine suggestions ready')
    } catch (e: any) {
      fail(actId, e?.message || 'Refine failed')
    }
  }

  const applySelected = () => {
    const a = appliedDraft
    ;(state as any).draft = a
    setRefineOpen(false)
  }

  const payload = useMemo(() => JSON.stringify({
    title: state.draft.title,
    excerpt: state.draft.excerpt,
    content_md: state.draft.content_md,
    cover_image_url: state.cover_image_url,
    tags: state.draft.tags || [],
    reading_time_minutes: state.draft.reading_time_minutes,
  }), [state])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-2">{refineOpen ? 'Refine preview' : 'Preview'}</div>
          {!refineOpen ? (
            <div className="mt-2">
              <h1 className="text-2xl font-bold">{d.title}</h1>
              <p className="text-sm opacity-80 mt-1">{d.excerpt}</p>
              {state.cover_image_url && (
                <img src={state.cover_image_url} alt="cover" className="rounded-md mt-3 w-full object-cover aspect-[16/9]" />
              )}
              <div className="prose prose-lg dark:prose-invert mt-4 bg-white/70 dark:bg-neutral-900/70 p-5 rounded-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {d.content_md || ''}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
                <div className="text-xs uppercase opacity-70 mb-2">Original</div>
                <h2 className="text-lg font-semibold">{d.title}</h2>
                <div className="text-sm opacity-80">{d.excerpt}</div>
                <div className="prose dark:prose-invert mt-3 max-h-[50vh] overflow-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {d.content_md || ''}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
                <div className="text-xs uppercase opacity-70 mb-2">Refined (selected changes)</div>
                <h2 className="text-lg font-semibold">{appliedDraft.title}</h2>
                <div className="text-sm opacity-80">{appliedDraft.excerpt}</div>
                <div className="prose dark:prose-invert mt-3 max-h-[50vh] overflow-auto bg-white/70 dark:bg-neutral-900/70 p-3 rounded">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {appliedDraft.content_md || ''}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="lg:col-span-1 space-y-3">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-1">Actions</div>
          {!refineOpen ? (
            <div className="flex flex-col gap-2">
              <button onClick={openRefine} className="w-full px-4 py-3 rounded bg-black/90 text-white hover:bg-black">Refine Draft</button>
              <form>
                <button formAction={savePostAction.bind(null, 'draft', payload)} className="w-full px-4 py-3 rounded bg-black text-white dark:bg-white dark:text-black">Save as Draft</button>
              </form>
              <form>
                <button formAction={savePostAction.bind(null, 'published', payload)} className="w-full px-4 py-3 rounded bg-emerald-600 text-white">Publish</button>
              </form>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase opacity-70">Proposed changes</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleAll(true)} className="text-xs px-2 py-1 rounded bg-black/10 dark:bg-white/10">Select all</button>
                  <button onClick={() => toggleAll(false)} className="text-xs px-2 py-1 rounded bg-black/10 dark:bg-white/10">Clear</button>
                </div>
              </div>
              <div className="max-h-64 overflow-auto space-y-2">
                {changes.map((ch) => (
                  <label key={ch.id} className="flex items-start gap-2 rounded border border-black/10 dark:border-white/10 p-2 text-sm">
                    <input type="checkbox" checked={!!selected[ch.id]} onChange={(e) => setSelected({ ...selected, [ch.id]: e.target.checked })} />
                    <div className="flex-1">
                      <div className="text-xs opacity-60">{ch.field}{ch.kind ? `/${ch.kind}` : ''}</div>
                      <div className="font-medium">{ch.rationale || 'Suggestion'}</div>
                    </div>
                  </label>
                ))}
                {!changes.length && <div className="text-sm opacity-60">No changes proposed.</div>}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={applySelected} className="flex-1 px-3 py-2 rounded bg-black text-white dark:bg-white dark:text-black">Apply selected</button>
                <button onClick={() => setRefineOpen(false)} className="px-3 py-2 rounded bg-black/10 dark:bg-white/10">Cancel</button>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-1">Metadata</div>
          <div className="text-xs opacity-80">Tags: {(d.tags || []).join(', ') || '—'}</div>
          <div className="text-xs opacity-80">Reading time: {d.reading_time_minutes ?? '—'} min</div>
        </div>
      </div>
    </div>
  )
}
