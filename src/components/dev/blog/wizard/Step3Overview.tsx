"use client"

import { useRef, useState, useEffect } from 'react'
import type { ChatMessage, WizardState } from './types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useActivity } from './activity/ActivityContext'

export default function Step3Overview({ state, setState }: { state: WizardState; setState: (s: Partial<WizardState>) => void }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bootedRef = useRef(false)
  const d = state.draft || {}
  const { start, complete, fail } = useActivity()
  const quickChips = [
    'Tighten the introduction and hook',
    'Add skimmable bullets to long sections',
    'Strengthen the conclusion with a takeaway',
    'Make tone more confident and direct',
    'Replace jargon with plain language',
    'Improve transitions between sections',
  ]

  const send = async () => {
    const messages: ChatMessage[] = [...(state.edit_messages || []), { role: 'user', content: input }]
    setState({ edit_messages: messages })
    setInput('')
    setLoading(true)
    setError(null)
    const actId = start('Applying edits…')
    try {
      const res = await fetch('/api/dev/blog/edit-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: d, messages, context: { goal: state.goals, anchors: state.keywords } }),
      })
      const json = await res.json()
      if (!res.ok) {
        fail(actId, json?.error || 'Edit failed')
        throw new Error(json?.error || 'Edit failed')
      }
      setState({ draft: json.draft, edit_messages: [...messages, { role: 'assistant', content: json.reply }] })
      complete(actId, 'Edits applied')
    } catch (e: any) {
      setError(e?.message || 'Edit error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bootedRef.current) return
    if ((state.edit_messages || []).length > 0) return
    bootedRef.current = true
    const welcome = 'What specific changes would you like to make? For example: tone tweaks, stronger intro, clearer subheadings, or tighten a section.'
    setState({ edit_messages: [{ role: 'assistant', content: welcome }] })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-5">
        {/* 1) Core details */}
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white/70 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-2">Core details</div>
          <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Title</label>
              <input
                value={d.title || ''}
                onChange={(e) => setState({ draft: { ...d, title: e.target.value } })}
                className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-3 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Excerpt</label>
              <textarea
                value={d.excerpt || ''}
                onChange={(e) => setState({ draft: { ...d, excerpt: e.target.value } })}
                rows={4}
                className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-3 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Tags</label>
              <input
                value={(d.tags || []).join(', ')}
                onChange={(e) => setState({ draft: { ...d, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })}
                placeholder="Comma separated"
                className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-3 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Quick repair (AI)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setInput(chip)}
                  className="px-2.5 py-1.5 text-xs rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20"
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-3 min-h-[160px] max-h-[220px] overflow-auto">
              <div className="space-y-3">
                {state.edit_messages?.map((m, i) => {
                  const isUser = m.role === 'user'
                  const bubbleBase = 'inline-block max-w-[95%] rounded-lg px-3 py-2 align-top'
                  const bubbleTone = isUser
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-black/5 dark:bg-white/10'
                  const proseTone = isUser ? 'prose-invert' : ''
                  return (
                    <div key={i} className={isUser ? 'text-right' : 'text-left'}>
                      <div className={`${bubbleBase} ${bubbleTone}`}>
                        <div className={`prose prose-sm ${proseTone} max-w-none [&>p:first-child]:mt-0 [&>p:last-child]:mb-0`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {state.edit_messages?.length === 0 && (
                  <div className="text-xs opacity-70">Type a quick change below and press Send.</div>
                )}
              </div>
            </div>
            <div className="mt-2 flex gap-2 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe a change…"
                className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
              />
              <button onClick={send} disabled={!input.trim()} className="shrink-0 px-3 py-2 rounded bg-black text-white text-sm dark:bg-white dark:text-black">
                {loading ? 'Applying…' : 'Send'}
              </button>
            </div>
            {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
          </div>
          </div>
        </div>

        {/* 2) Body editing */}
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white/70 dark:bg-neutral-900/60">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">Body (Markdown)</label>
          <textarea
            value={d.content_md || ''}
            onChange={(e) => setState({ draft: { ...d, content_md: e.target.value } })}
            rows={16}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-3 font-mono text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
          />
          <div className="text-[11px] opacity-70 mt-1">Use the preview drawer to confirm rendered formatting.</div>
        </div>
      </div>
      <div className="lg:col-span-1 space-y-3">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-1">Context</div>
          <div className="text-xs opacity-80">Topic: {state.topic || '—'}</div>
          <div className="text-xs opacity-80">Goal: {state.goals || '—'}</div>
          <div className="text-xs opacity-80">Anchors: {state.keywords?.join(', ') || '—'}</div>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs opacity-70">Use the preview drawer to see the updated rendered output. Your edits apply to the working draft.</div>
        </div>
      </div>
    </div>
  )
}
