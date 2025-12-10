"use client"

import { useEffect, useMemo, useState } from 'react'

type Status = 'draft' | 'published' | 'archived'

export interface PostData {
  id?: string
  title: string
  slug?: string
  excerpt?: string
  content_md?: string
  cover_image_url?: string
  status?: Status
  tags?: string[]
  published_at?: string
  reading_time_minutes?: number
}

export default function PostForm({ initial, onSaved }: { initial?: Partial<PostData>; onSaved: (post: any) => void }) {
  const [data, setData] = useState<PostData>({
    title: '',
    slug: '',
    excerpt: '',
    content_md: '',
    cover_image_url: '',
    status: 'draft',
    tags: [],
    reading_time_minutes: undefined,
    ...initial,
  })
  const [tagsString, setTagsString] = useState<string>((initial?.tags || []).join(', '))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTagsString((initial?.tags || []).join(', '))
  }, [initial])

  const tagArray = useMemo(() => tagsString.split(',').map((s) => s.trim()).filter(Boolean), [tagsString])

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/dev/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tags: tagArray }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to save')
      onSaved(json.post)
    } catch (e: any) {
      setError(e?.message || 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Compose</h3>
      <div className="grid gap-3">
        <input
          value={data.title}
          onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
          placeholder="Title"
          className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2"
        />
        <input
          value={data.slug || ''}
          onChange={(e) => setData((d) => ({ ...d, slug: e.target.value }))}
          placeholder="Slug (optional)"
          className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2"
        />
        <input
          value={data.cover_image_url || ''}
          onChange={(e) => setData((d) => ({ ...d, cover_image_url: e.target.value }))}
          placeholder="Cover image URL (optional)"
          className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2"
        />
        <textarea
          value={data.excerpt || ''}
          onChange={(e) => setData((d) => ({ ...d, excerpt: e.target.value }))}
          placeholder="Excerpt (<= 220 chars)"
          rows={3}
          className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2"
        />
        <textarea
          value={data.content_md || ''}
          onChange={(e) => setData((d) => ({ ...d, content_md: e.target.value }))}
          placeholder="Markdown content"
          rows={12}
          className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 font-mono text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={data.status}
            onChange={(e) => setData((d) => ({ ...d, status: e.target.value as Status }))}
            className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <input
            value={tagsString}
            onChange={(e) => setTagsString(e.target.value)}
            placeholder="Tags (comma separated)"
            className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black">
            {saving ? 'Saving…' : 'Save Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

