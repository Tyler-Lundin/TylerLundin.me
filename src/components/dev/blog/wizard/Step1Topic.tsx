"use client"

import { useState } from 'react'
import type { WizardState } from './types'

export default function Step1Topic({ state, setState }: { state: WizardState; setState: (s: Partial<WizardState>) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const suggest = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dev/blog/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.topic,
          goals: state.goals,
          audience: state.audience,
          keywords: state.keywords,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load')
      setState({ suggestions: json.ideas || [] })
    } catch (e: any) {
      setError(e?.message || 'Error fetching ideas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <div className="grid gap-2">
          <label className="text-xs uppercase opacity-70">Topic</label>
          <input
            value={state.topic}
            onChange={(e) => setState({ topic: e.target.value })}
            placeholder="What should we write about?"
            className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase opacity-70">Goals</label>
            <input
              value={state.goals}
              onChange={(e) => setState({ goals: e.target.value })}
              placeholder="e.g., teach, persuade, showcase"
              className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs uppercase opacity-70">Audience</label>
            <input
              value={state.audience}
              onChange={(e) => setState({ audience: e.target.value })}
              placeholder="e.g., small biz owners, devs"
              className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-xs uppercase opacity-70">Keywords (comma separated)</label>
          <input
            value={state.keywords.join(', ')}
            onChange={(e) => setState({ keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="next.js, supabase, performance"
            className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2"
          />
        </div>
        <div className="pt-2">
          <button onClick={suggest} disabled={loading} className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black">
            {loading ? 'Suggesting…' : 'Suggest Ideas'}
          </button>
          {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-md border border-black/10 dark:border-white/10 p-3 h-full overflow-auto bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-2">Suggestions</div>
          <div className="space-y-2">
            {state.suggestions?.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => setState({ topic: sug.title })}
                className="block w-full text-left rounded border border-black/10 dark:border-white/10 p-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <div className="font-medium">{sug.title}</div>
                {sug.angle && <div className="text-xs opacity-70">{sug.angle}</div>}
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

