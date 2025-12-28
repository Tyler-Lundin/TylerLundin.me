"use client"

import { useRef, useState, useEffect } from 'react'
import type { ChatMessage, WizardState } from './types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useActivity } from './activity/ActivityContext'
import { Sparkles, Send } from 'lucide-react'

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
    <div className="mx-auto max-w-3xl space-y-8">
      
      {/* --- Card 1: Core Details --- */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Review & Edit Draft</h2>
          <p className="mt-1 text-sm text-neutral-500">
            This is your working draft. Edit the title, excerpt, and markdown content directly. Use the AI editor for quick revisions.
          </p>
        </div>
        <div className="space-y-6 border-t border-neutral-200 p-6 dark:border-neutral-800">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Title</label>
            <input
              value={d.title || ''}
              onChange={(e) => setState({ draft: { ...d, title: e.target.value } })}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Excerpt</label>
            <textarea
              value={d.excerpt || ''}
              onChange={(e) => setState({ draft: { ...d, excerpt: e.target.value } })}
              rows={3}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tags</label>
            <input
              value={(d.tags || []).join(', ')}
              onChange={(e) => setState({ draft: { ...d, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })}
              placeholder="Comma separated"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* --- Card 2: AI Quick Editor --- */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">AI Quick Editor</h2>
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            Need a quick fix? Ask the assistant to make specific changes to the draft.
          </p>
        </div>
        <div className="border-t border-neutral-200 bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="mb-4 flex flex-wrap gap-2">
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setInput(chip)}
                className="rounded-full bg-white px-3 py-1 text-xs text-neutral-600 ring-1 ring-inset ring-neutral-200 transition hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-700"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="h-[200px] space-y-4 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            {state.edit_messages?.map((m, i) => {
              const isUser = m.role === 'user'
              return (
                <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'rounded-br-none bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'rounded-bl-none bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && input.trim() && send()}
              placeholder="Describe a change…"
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            />
            <button onClick={send} disabled={!input.trim()} className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Card 3: Body Content --- */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Body Content</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Edit the full post content using Markdown. Use the preview drawer (top right) to see your changes rendered live.
          </p>
        </div>
        <div className="border-t border-neutral-200 p-2 dark:border-neutral-800">
          <textarea
            value={d.content_md || ''}
            onChange={(e) => setState({ draft: { ...d, content_md: e.target.value } })}
            rows={20}
            className="w-full rounded-lg border-transparent bg-white p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-transparent dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          />
        </div>
      </div>

    </div>
  )
}

