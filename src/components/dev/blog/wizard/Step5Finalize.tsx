"use client"

import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { savePostAction } from '@/app/dev/actions/blog'
import type { WizardState } from './types'
import { useActivity } from './activity/ActivityContext'
import { Check, Sparkles, FileText, ChevronRight } from 'lucide-react'

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
    base: 'dev',
    id: state.draft.id,
    title: state.draft.title,
    excerpt: state.draft.excerpt,
    content_md: state.draft.content_md,
    cover_image_url: state.cover_image_url,
    tags: state.draft.tags || [],
    reading_time_minutes: state.draft.reading_time_minutes,
  }), [state])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      
      {/* --- Card 1: Actions --- */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Publish Your Post</h2>
          <p className="mt-1 text-sm text-neutral-500">
            One final review. You can publish now, save as a draft for later, or ask the AI for one last pass.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 border-t border-neutral-200 p-6 sm:grid-cols-3 dark:border-neutral-800">
          <button onClick={openRefine} className="flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 text-center text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-blue-400">
            <Sparkles className="h-5 w-5" />
            Refine with AI
          </button>
          <form className="contents">
            <button formAction={savePostAction.bind(null, 'draft', payload)} className="flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 text-center text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white">
              <FileText className="h-5 w-5" />
              Save as Draft
            </button>
          </form>
          <form className="contents">
            <button formAction={savePostAction.bind(null, 'published', payload)} className="flex flex-col items-center justify-center gap-2 rounded-lg bg-emerald-600 p-4 text-center text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700">
              <ChevronRight className="h-5 w-5" />
              Publish Post
            </button>
          </form>
        </div>
      </div>
      
      {/* --- Card 2: Final Preview --- */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Final Preview</h2>
        </div>
        <div className="border-t border-neutral-200 p-6 dark:border-neutral-800">
          <div className="space-y-4">
            {state.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={state.cover_image_url} alt="cover" className="w-full rounded-lg object-cover aspect-[16/9] shadow-md" />
            )}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{d.title}</h1>
              <p className="text-lg text-neutral-500">{d.excerpt}</p>
              {(d.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {d.tags?.map(t => (
                    <span key={t} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">#{t}</span>
                  ))}
                </div>
              )}
            </div>
            <article className="prose prose-neutral max-w-none pt-4 dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {d.content_md || ''}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      </div>

      {/* --- Refine Modal --- */}
      {refineOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm dark:bg-black/50" onClick={() => setRefineOpen(false)} />
          <div className="relative w-full max-w-4xl rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="p-6">
              <h3 className="text-lg font-semibold">Refine Suggestions</h3>
              <p className="text-sm text-neutral-500">Select the changes you'd like to apply to your draft.</p>
            </div>
            <div className="max-h-[60vh] overflow-y-auto border-y border-neutral-200 p-6 dark:border-neutral-800">
              <div className="space-y-4">
                <div className="flex items-center justify-end gap-3">
                  <button onClick={() => toggleAll(true)} className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Select All</button>
                  <button onClick={() => toggleAll(false)} className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Deselect All</button>
                </div>
                {changes.map((ch) => (
                  <label key={ch.id} className="block cursor-pointer rounded-lg border border-neutral-200 p-4 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50">
                    <div className="flex items-start gap-4">
                      <input type="checkbox" checked={!!selected[ch.id]} onChange={(e) => setSelected({ ...selected, [ch.id]: e.target.checked })} className="mt-1 h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:ring-offset-neutral-900" />
                      <div className="flex-1">
                        <div className="font-medium text-neutral-900 dark:text-white">{ch.rationale || 'Suggestion'}</div>
                        <div className="text-xs text-neutral-500">{ch.field}{ch.kind ? ` / ${ch.kind}` : ''}</div>
                        {ch.before_snippet && ch.after_snippet && (
                          <div className="mt-2 text-xs">
                            <p className="my-1 rounded bg-rose-50 p-2 text-rose-700 line-through dark:bg-rose-900/20 dark:text-rose-300">-{ch.before_snippet}</p>
                            <p className="my-1 rounded bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">+{ch.after_snippet}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
                {!changes.length && <div className="p-8 text-center text-sm text-neutral-500">No changes proposed.</div>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-neutral-50 p-4 dark:bg-neutral-900/50">
              <button onClick={() => setRefineOpen(false)} className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">Cancel</button>
              <button onClick={applySelected} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">Apply Selected</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
