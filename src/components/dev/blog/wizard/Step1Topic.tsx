"use client"

import { useMemo, useState, useEffect } from 'react'
import { Wand2, CheckCircle2, Lightbulb } from 'lucide-react'
import type { WizardState } from './types'
import { useActivity } from './activity/ActivityContext'

export default function Step1Topic({ state, setState }: { state: WizardState; setState: (s: Partial<WizardState>) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { start, complete, fail } = useActivity()
  const [goalInput, setGoalInput] = useState(state.goals || '')
  const [keywordsInput, setKeywordsInput] = useState((state.keywords || []).join(', '))

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
    <div className="mx-auto max-w-3xl space-y-8">
      
      {/* --- Card 1: Goal & Keywords --- */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Define Your Topic</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Start by defining the goal and any keywords. We'll use this to generate targeted topic ideas.
          </p>
        </div>
        
        <div className="space-y-6 border-t border-neutral-200 p-6 dark:border-neutral-800">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">What's the goal?</label>
            <input
              value={goalInput}
              onChange={(e) => {
                const v = e.target.value
                setGoalInput(v)
                setState({ goals: v })
              }}
              onBlur={() => setState({ goals: cleanGoal(goalInput) })}
              placeholder="e.g., Persuade small business owners to rethink templates"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Keywords (Optional)</label>
            <input
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              onBlur={() => setState({ keywords: cleanKeywords(keywordsInput) })}
              placeholder="e.g., website strategy, bespoke design, no-code"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
          <button 
            onClick={suggest} 
            disabled={loading || !goalInput.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Lightbulb className="h-4 w-4" />
            {loading ? 'Suggesting Ideas...' : 'Suggest Ideas'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* --- Card 2: Suggestions --- */}
      {state.suggestions && state.suggestions.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 p-6 dark:border-neutral-800">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Choose Your Topic</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Select one of the AI-generated topics below to proceed.
            </p>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {state.suggestions?.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => setState({ topic: sug.title })}
                className={
                  'w-full p-6 text-left transition-colors ' +
                  (state.topic === sug.title
                    ? 'bg-blue-50 dark:bg-blue-900/10'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50')
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">{sug.title}</p>
                    {sug.angle && <p className="mt-1 text-sm text-neutral-500 italic">"{sug.angle}"</p>}
                  </div>
                  {state.topic === sug.title && (
                    <div className="flex shrink-0 items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Selected
                    </div>
                  )}
                </div>
                {sug.key_points && (
                  <ul className="mt-4 list-inside list-disc space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                    {sug.key_points.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


