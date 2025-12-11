"use client"

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage, WizardState } from './types'
import { useActivity } from './activity/ActivityContext'

export default function Step2Chat({ state, setState, onGenerate }: {
  state: WizardState
  setState: (s: Partial<WizardState>) => void
  onGenerate: () => Promise<void>
}) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booting, setBooting] = useState(false)
  const bootedRef = useRef(false)

  const { start, complete, fail } = useActivity()

  const send = async () => {
    const messages: ChatMessage[] = [...(state.messages || []), { role: 'user', content: input }]
    setState({ messages })
    setInput('')
    setLoading(true)
    setError(null)
    try {
      const actId = start('Chatting with assistant…')
      const res = await fetch('/api/dev/blog/idea-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          context: { topic: state.topic, goals: state.goals, audience: state.audience, keywords: state.keywords },
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        fail(actId, json?.error || 'Failed to chat')
        throw new Error(json?.error || 'Failed to chat')
      }
      setState({ messages: [...messages, { role: 'assistant', content: json.reply }] })
      complete(actId, 'Reply received')
    } catch (e: any) {
      setError(e?.message || 'Chat error')
    } finally {
      setLoading(false)
    }
  }

  // Kick off an initial assistant message based on current context
  useEffect(() => {
    if (bootedRef.current) return
    if ((state.messages || []).length > 0) return
    // Only auto-welcome if we have at least a goal or topic
    const hasContext = !!(state.goals?.trim() || state.topic?.trim())
    if (!hasContext) return
    bootedRef.current = true
    const run = async () => {
      setBooting(true)
      setError(null)
      const actId = start('Preparing suggestions…')
      try {
        const res = await fetch('/api/dev/blog/idea-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [],
            context: { topic: state.topic, goals: state.goals, audience: state.audience, keywords: state.keywords },
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          fail(actId, json?.error || 'Failed to chat')
          throw new Error(json?.error || 'Failed to chat')
        }
        setState({ messages: [{ role: 'assistant', content: json.reply }] })
        complete(actId, 'Suggestions ready')
      } catch (e: any) {
        setError(e?.message || 'Chat error')
      } finally {
        setBooting(false)
      }
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="rounded-lg border border-black/10 dark:border-white/10 h-[52vh] lg:h-[60vh] overflow-auto p-4 bg-white/70 dark:bg-neutral-900/60">
          {(state.messages || []).length === 0 && !booting && (
            <div className="text-sm opacity-60">Start a conversation to refine the idea.</div>
          )}
          <div className="space-y-4">
            {booting && (
              <div className="text-left">
                <div className="inline-block max-w-[85%] rounded-lg px-4 py-3 align-top bg-black/5 dark:bg-white/10">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span>Thinking…</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="h-2.5 w-48 bg-black/10 dark:bg-white/20 rounded" />
                    <div className="h-2.5 w-64 bg-black/10 dark:bg-white/20 rounded" />
                    <div className="h-2.5 w-40 bg-black/10 dark:bg-white/20 rounded" />
                  </div>
                </div>
              </div>
            )}
            {state.messages?.map((m, i) => {
              const isUser = m.role === 'user'
              const bubbleBase = 'inline-block max-w-[85%] rounded-lg px-4 py-2.5 align-top'
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
          </div>
        </div>
        <div className="mt-3 flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask or add details…"
            className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-3 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
          />
          <button onClick={send} disabled={!input.trim()} className="shrink-0 px-4 py-3 rounded bg-black text-white dark:bg-white dark:text-black">
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
        {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
      </div>
      <div className="lg:col-span-1">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-neutral-900/60 h-full">
          <div className="text-xs uppercase opacity-70 mb-2">Action</div>
          <button onClick={onGenerate} className="w-full px-4 py-3 rounded bg-emerald-600 text-white hover:bg-emerald-700">GENERATE</button>
          <div className="text-xs opacity-70 mt-3">
            Generates a full draft using the conversation plus your context.
          </div>
        </div>
      </div>
    </div>
  )
}
