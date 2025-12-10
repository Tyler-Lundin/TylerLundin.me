"use client"

import type { WizardState } from './types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Step3Overview({ state, setState }: { state: WizardState; setState: (s: Partial<WizardState>) => void }) {
  const d = state.draft || {}
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="grid gap-2">
              <label className="text-xs uppercase opacity-70">Title</label>
              <input
                value={d.title || ''}
                onChange={(e) => setState({ draft: { ...d, title: e.target.value } })}
                className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase opacity-70">Excerpt</label>
              <textarea
                value={d.excerpt || ''}
                onChange={(e) => setState({ draft: { ...d, excerpt: e.target.value } })}
                rows={3}
                className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase opacity-70">Tags (comma separated)</label>
              <input
                value={(d.tags || []).join(', ')}
                onChange={(e) => setState({ draft: { ...d, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })}
                className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase opacity-70">Markdown</label>
              <textarea
                value={d.content_md || ''}
                onChange={(e) => setState({ draft: { ...d, content_md: e.target.value } })}
                rows={16}
                className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2 font-mono text-sm"
              />
            </div>
          </div>
          <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-4 prose prose-lg dark:prose-invert overflow-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {d.content_md || ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1 space-y-3">
        <div className="rounded-md border border-black/10 dark:border-white/10 p-3 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-1">Reading time</div>
          <div className="text-sm">{d.reading_time_minutes ?? '—'} min</div>
        </div>
        <div className="rounded-md border border-black/10 dark:border-white/10 p-3 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-1">Context</div>
          <div className="text-xs opacity-80">Topic: {state.topic || '—'}</div>
          <div className="text-xs opacity-80">Goals: {state.goals || '—'}</div>
          <div className="text-xs opacity-80">Audience: {state.audience || '—'}</div>
          <div className="text-xs opacity-80">Keywords: {state.keywords?.join(', ') || '—'}</div>
        </div>
      </div>
    </div>
  )
}
