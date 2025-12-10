"use client"

import { useState } from 'react'
import type { ChatMessage, WizardState } from './types'

export default function Step2Chat({ state, setState, onGenerate }: {
  state: WizardState
  setState: (s: Partial<WizardState>) => void
  onGenerate: () => Promise<void>
}) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async () => {
    const messages: ChatMessage[] = [...(state.messages || []), { role: 'user', content: input }]
    setState({ messages })
    setInput('')
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dev/blog/idea-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          context: { topic: state.topic, goals: state.goals, audience: state.audience, keywords: state.keywords },
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to chat')
      setState({ messages: [...messages, { role: 'assistant', content: json.reply }] })
    } catch (e: any) {
      setError(e?.message || 'Chat error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="rounded-md border border-black/10 dark:border-white/10 h-[60vh] overflow-auto p-3 bg-white/70 dark:bg-neutral-900/60">
          {(state.messages || []).length === 0 && (
            <div className="text-sm opacity-60">Start a conversation to refine the idea.</div>
          )}
          <div className="space-y-3">
            {state.messages?.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={
                  'inline-block rounded-md px-3 py-2 text-sm ' +
                  (m.role === 'user' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-black/5 dark:bg-white/10')
                }>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask or add details…"
            className="flex-1 rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2"
          />
          <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black">
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
        {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
      </div>
      <div className="lg:col-span-1">
        <div className="rounded-md border border-black/10 dark:border-white/10 p-3 bg-white/60 dark:bg-neutral-900/60 h-full">
          <div className="text-xs uppercase opacity-70 mb-2">Action</div>
          <button onClick={onGenerate} className="w-full px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">GENERATE</button>
          <div className="text-xs opacity-70 mt-3">
            Generates a full draft using the conversation plus your context.
          </div>
        </div>
      </div>
    </div>
  )
}

