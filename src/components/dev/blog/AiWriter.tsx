"use client"

import { useState } from 'react'

interface DraftResponse {
  title?: string
  excerpt?: string
  tags?: string[]
  content_md?: string
  reading_time_minutes?: number
}

export default function AiWriter({ onDraft }: { onDraft: (d: DraftResponse) => void }) {
  const [title, setTitle] = useState('')
  const [brief, setBrief] = useState('')
  const [tone, setTone] = useState('direct, practical, experienced')
  const [points, setPoints] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dev/blog/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || undefined,
          brief: brief || undefined,
          tone: tone || undefined,
          points: points
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      onDraft(data.draft)
    } catch (e: any) {
      setError(e?.message || 'Error generating draft')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">AI Writer</h3>
      <div className="grid gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Working title (optional)"
          className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2"
        />
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Brief/context"
          rows={3}
          className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2"
        />
        <input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="Tone"
          className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2"
        />
        <textarea
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder={'Key points (one per line)'}
          rows={4}
          className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2"
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div>
          <button
            onClick={generate}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-60"
          >
            {loading ? 'Generating…' : 'Generate Draft'}
          </button>
        </div>
      </div>
    </div>
  )
}

