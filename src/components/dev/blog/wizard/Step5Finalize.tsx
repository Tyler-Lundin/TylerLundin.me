"use client"

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { savePostAction } from '@/app/dev/actions/blog'
import type { WizardState } from './types'

export default function Step5Finalize({ state }: { state: WizardState }) {
  const payload = useMemo(() => JSON.stringify({
    title: state.draft.title,
    excerpt: state.draft.excerpt,
    content_md: state.draft.content_md,
    cover_image_url: state.cover_image_url,
    tags: state.draft.tags || [],
    reading_time_minutes: state.draft.reading_time_minutes,
  }), [state])

  const d = state.draft || {}

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <div className="rounded-md border border-black/10 dark:border-white/10 p-3 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70">Preview</div>
          <div className="mt-2">
            <h1 className="text-2xl font-bold">{d.title}</h1>
            <p className="text-sm opacity-80 mt-1">{d.excerpt}</p>
            {state.cover_image_url && (
              <img src={state.cover_image_url} alt="cover" className="rounded-md mt-3" />
            )}
            <div className="prose prose-lg dark:prose-invert mt-4 bg-white/70 dark:bg-neutral-900/70 p-4 rounded-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {d.content_md || ''}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1 space-y-3">
        <div className="rounded-md border border-black/10 dark:border-white/10 p-3 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-1">Actions</div>
          <div className="flex flex-col gap-2">
            <form>
              <button formAction={savePostAction.bind(null, 'draft', payload)} className="w-full px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black">
                Save as Draft
              </button>
            </form>
            <form>
              <button formAction={savePostAction.bind(null, 'published', payload)} className="w-full px-4 py-2 rounded bg-emerald-600 text-white">
                Publish
              </button>
            </form>
          </div>
        </div>
        <div className="rounded-md border border-black/10 dark:border-white/10 p-3 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-1">Metadata</div>
          <div className="text-xs opacity-80">Tags: {(d.tags || []).join(', ') || '—'}</div>
          <div className="text-xs opacity-80">Reading time: {d.reading_time_minutes ?? '—'} min</div>
        </div>
      </div>
    </div>
  )
}
