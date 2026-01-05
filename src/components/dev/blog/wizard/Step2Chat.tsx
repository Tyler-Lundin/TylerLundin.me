"use client"

import { useEffect, useRef, useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage, WizardState } from './types'
import { useActivity } from './activity/ActivityContext'
import { Send, Sparkles, Maximize, Minimize, CornerDownLeft, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function ChatInterface({ state, input, setInput, send, loading, error, isFullScreen = false }: {
  state: WizardState,
  input: string,
  setInput: (s: string) => void,
  send: () => void,
  loading: boolean,
  error: string | null,
  isFullScreen?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  // Smart Autoscroll Logic
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    // If user is within 100px of bottom, re-enable autoscroll
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100
    setShouldAutoScroll(isAtBottom)
  }

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [state.messages, loading, shouldAutoScroll])

  const booting = !state.messages || state.messages.length === 0

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${isFullScreen ? 'h-full' : 'h-[600px]'}`}>
      {/* Messages Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 scroll-smooth custom-scrollbar"
      >
        <AnimatePresence mode="popLayout">
          {booting && (
            <motion.div key="booting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-tl-none px-4 py-3">
                <p className="text-sm text-neutral-500 animate-pulse">Waking up the assistant...</p>
              </div>
            </motion.div>
          )}

          {state.messages?.map((m, i) => (
            <MessageBubble key={`msg-${i}`} message={m} index={i} />
          ))}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-2xl rounded-tl-none text-xs font-medium flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> Assistant is thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
        <div className="relative flex items-center gap-2 group">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (input.trim() && !loading) send()
              }
            }}
            placeholder="Refine the angle, add constraints..."
            className="w-full resize-none rounded-2xl border border-neutral-200 
            bg-neutral-50 px-4 py-3 pr-12 text-sm transition-all focus:border-blue-500 
            focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 
            dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:scale-105 active:scale-95 disabled:opacity-30 dark:bg-white dark:text-black"
          >
            <CornerDownLeft className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="mt-2 text-center text-xs font-medium text-rose-500">{error}</p>}
      </div>
    </div>
  )
}

function MessageBubble({ message, index }: { message: ChatMessage, index: number }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
    >
      <div className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${isUser
          ? 'bg-neutral-900 text-white rounded-br-none dark:bg-white dark:text-black'
          : 'bg-white border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 rounded-bl-none shadow-neutral-200/50 dark:shadow-none'
        }`}>
        <div className={`prose prose-sm max-w-none break-words ${isUser ? 'prose-invert font-medium' : 'dark:prose-invert'}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
        <span className={`absolute bottom-0 ${isUser ? '-right-12' : '-left-12'} text-[10px] font-bold uppercase tracking-tighter text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity uppercase`}>
          {isUser ? 'You' : 'AI'}
        </span>
      </div>
    </motion.div>
  )
}

export default function Step2Chat({ state, setState, onGenerate }: {
  state: WizardState
  setState: (s: Partial<WizardState>) => void
  onGenerate: () => Promise<void>
}) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const bootedRef = useRef(false)

  const { start, complete, fail } = useActivity()

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: input }
    const messages = [...(state.messages || []), userMsg]
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
      if (!res.ok) throw new Error(json?.error || 'Failed to chat')

      setState({ messages: [...messages, { role: 'assistant', content: json.reply }] })
      complete(actId, 'Reply received')
    } catch (e: any) {
      setError(e?.message || 'Chat error')
      fail('chat', e.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Initial Boot
  useEffect(() => {
    if (bootedRef.current || (state.messages || []).length > 0) return
    if (!(state.goals?.trim() || state.topic?.trim())) return

    bootedRef.current = true
    const run = async () => {
      setLoading(true)
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
        if (res.ok) setState({ messages: [{ role: 'assistant', content: json.reply }] })
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    run()
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900 transition-all">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400">Concept Lab</h2>
          </div>
          <button
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all active:scale-95"
          >
            <Maximize className="h-3 w-3" /> Fullscreen
          </button>
        </div>

        <ChatInterface
          state={state}
          input={input}
          setInput={setInput}
          send={send}
          loading={loading}
          error={error}
        />
      </div>

      <div className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-emerald-500/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Ready to materialize?</h2>
            <p className="text-sm text-neutral-500">Transform this conversation into a structured draft.</p>
          </div>
          <button onClick={onGenerate} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:translate-y-[-2px] active:translate-y-0">
            <Sparkles className="h-4 w-4" />
            Build Draft
          </button>
        </div>
      </div>

      {/* Fullscreen Modal Refactored for proper scrolling */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] bg-neutral-950/80 backdrop-blur-md p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-8 py-6 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Deep Work Session</h3>
                </div>
                <button onClick={() => setIsFullScreen(false)} className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <Minimize className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <ChatInterface
                  state={state}
                  input={input}
                  setInput={setInput}
                  send={send}
                  loading={loading}
                  error={error}
                  isFullScreen={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #e5e5e5; 
          border-radius: 10px; 
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
      `}</style>
    </div>
  )
}
