"use client"

import { useMemo, useState, useEffect } from 'react'
import { Wand2, CheckCircle2 } from 'lucide-react'
import type { WizardState } from './types'
import { useActivity } from './activity/ActivityContext'

export default function Step1Topic({ state, setState }: { state: WizardState; setState: (s: Partial<WizardState>) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { start, complete, fail } = useActivity()
  const [goalInput, setGoalInput] = useState(state.goals || '')
  const [keywordsInput, setKeywordsInput] = useState((state.keywords || []).join(', '))
  const [goalRefineOpen, setGoalRefineOpen] = useState(false)
  const [goalSuggestions, setGoalSuggestions] = useState<string[]>([])
  const [kwRefineOpen, setKwRefineOpen] = useState(false)
  const [kwSuggestions, setKwSuggestions] = useState<string[]>([])

  useEffect(() => {
    setGoalInput(state.goals || '')
  }, [state.goals])

  useEffect(() => {
    setKeywordsInput((state.keywords || []).join(', '))
  }, [state.keywords])

  function cleanGoal(input: string): string {
    const trimmed = (input || '').replace(/\s+/g, ' ').trim()
    return trimmed.slice(0, 240)
  }

  function cleanKeywords(input: string): string[] {
    const tokens = (input || '')
      .split(',')
      .map((t) => t.replace(/[#]+/g, '').toLowerCase().trim())
      .map((t) => t.replace(/[^a-z0-9\-\s]/g, ''))
      .map((t) => t.replace(/\s+/g, ' '))
      .filter(Boolean)
    const dedup: string[] = []
    for (const t of tokens) {
      if (!dedup.includes(t)) dedup.push(t)
    }
    return dedup.slice(0, 8)
  }

  async function refineGoal() {
    if (!goalInput.trim()) return
    const actId = start('Refining goal…')
    try {
      const res = await fetch('/api/dev/blog/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'goal', value: goalInput, context: { anchors: cleanKeywords(keywordsInput) } }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to refine')
      setGoalSuggestions(json.suggestions || [])
      setGoalRefineOpen(true)
      complete(actId, 'Found rephrases')
    } catch (e: any) {
      fail(actId, e?.message || 'Refine failed')
    }
  }

  async function refineKeywords() {
    const actId = start('Refining keywords…')
    try {
      const res = await fetch('/api/dev/blog/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'keywords', value: keywordsInput, context: { goal: cleanGoal(goalInput) } }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to refine')
      setKwSuggestions(json.suggestions || [])
      setKwRefineOpen(true)
      complete(actId, 'Keyword options ready')
    } catch (e: any) {
      fail(actId, e?.message || 'Refine failed')
    }
  }

  const suggest = async () => {
    setLoading(true)
    setError(null)
    const actId = start('Fetching idea suggestions…')
    try {
      const res = await fetch('/api/dev/blog/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals: cleanGoal(goalInput),
          keywords: cleanKeywords(keywordsInput),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load')
      setState({ suggestions: json.ideas || [] })
      complete(actId, 'Suggestions ready')
    } catch (e: any) {
      fail(actId, e?.message || 'Error fetching ideas')
      setError(e?.message || 'Error fetching ideas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <div className="flex flex-col gap-2 relative">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">What is the goal of this blog post?</label>
          <div className="flex items-center gap-2">
            <input
              value={goalInput}
              onChange={(e) => {
                const v = e.target.value
                setGoalInput(v)
                setState({ goals: v })
              }}
              onBlur={() => setState({ goals: cleanGoal(goalInput) })}
              placeholder="e.g., persuade small business owners to rethink templates"
              className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-3 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
            />
            <button
              type="button"
              onClick={refineGoal}
              disabled={!goalInput.trim()}
              title="Refine goal"
              className="shrink-0 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200"
            >
              <Wand2 size={18} />
            </button>
          </div>
          {goalRefineOpen && (
            <div className="absolute z-10 top-[100%] mt-2 left-0 right-0 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-xl">
              <div className="p-2 text-xs uppercase opacity-60">Refine goal</div>
              <div className="max-h-60 overflow-auto p-2 space-y-2">
                {goalSuggestions.map((s, i) => (
                  <button
                    key={i}
                    className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => {
                      setGoalInput(s)
                      setState({ goals: s })
                      setGoalRefineOpen(false)
                    }}
                  >
                    {s}
                  </button>
                ))}
                {!goalSuggestions.length && (
                  <div className="text-sm opacity-60 px-3 py-2">No suggestions</div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 p-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => setGoalRefineOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 relative">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Keywords (optional, comma-separated)</label>
          <div className="flex items-center gap-2">
            <input
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              onBlur={() => setState({ keywords: cleanKeywords(keywordsInput) })}
              placeholder="e.g., website strategy, bespoke design, no-code tools"
              className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-3 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
            />
            <button
              type="button"
              onClick={refineKeywords}
              title="Refine keywords"
              className="shrink-0 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200"
            >
              <Wand2 size={18} />
            </button>
          </div>
          {useMemo(() => cleanKeywords(keywordsInput), [keywordsInput]).length > 0 && (
            <div className="text-xs opacity-70">Anchors: {cleanKeywords(keywordsInput).join(', ')}</div>
          )}
          {kwRefineOpen && (
            <div className="absolute z-10 top-[100%] mt-2 left-0 right-0 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-xl">
              <div className="p-2 text-xs uppercase opacity-60">Refine keywords</div>
              <div className="max-h-60 overflow-auto p-2 space-y-2">
                {kwSuggestions.map((s, i) => (
                  <button
                    key={i}
                    className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => {
                      setKeywordsInput(s)
                      setState({ keywords: cleanKeywords(s) })
                      setKwRefineOpen(false)
                    }}
                  >
                    {s}
                  </button>
                ))}
                {!kwSuggestions.length && (
                  <div className="text-sm opacity-60 px-3 py-2">No suggestions</div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 p-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => setKwRefineOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="pt-2">
          <button onClick={suggest} className="w-full sm:w-auto px-4 py-3 rounded bg-black text-white dark:bg-white dark:text-black">
            {loading ? 'Suggesting…' : 'Suggest Ideas'}
          </button>
          {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 h-full overflow-auto bg-white/60 dark:bg-neutral-900/60">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase opacity-70">Suggestions</div>
            {!!state.topic && (
              <div className="text-[11px] opacity-80 flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Selected: <span className="font-medium truncate max-w-[18ch]">{state.topic}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {state.suggestions?.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => setState({ topic: sug.title })}
                className={
                  'block w-full text-left rounded-md border p-3 transition-colors ' +
                  (state.topic === sug.title
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/10'
                    : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10')
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium flex-1">{sug.title}</div>
                  {state.topic === sug.title && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 size={14} /> Selected
                    </span>
                  )}
                </div>
                {sug.angle && <div className="text-xs opacity-70 mt-0.5">{sug.angle}</div>}
                {sug.key_points && (
                  <ul className="text-xs mt-1 list-disc pl-4 opacity-80">
                    {sug.key_points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
              </button>
            ))}
            {!state.suggestions?.length && <div className="text-sm opacity-60">No suggestions yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
