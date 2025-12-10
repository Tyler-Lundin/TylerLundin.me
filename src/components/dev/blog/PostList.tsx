"use client"

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

interface PostRow {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  updated_at?: string
  published_at?: string
}

export default function PostList({ onSelect }: { onSelect: (post: any) => void }) {
  const [rows, setRows] = useState<PostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/dev/blog/posts')
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load')
        setRows(json.posts || [])
      } catch (e: any) {
        setError(e?.message || 'Error loading posts')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Posts</h3>
        {loading && <span className="text-xs opacity-70">Loading…</span>}
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <div className="overflow-hidden rounded-md border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Slug</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Updated</th>
              <th className="text-left p-2">Published</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-black/5 dark:border-white/10">
                <td className="p-2">{r.title}</td>
                <td className="p-2 text-neutral-500">{r.slug}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2 text-neutral-500">{formatDate(r.updated_at)}</td>
                <td className="p-2 text-neutral-500">{formatDate(r.published_at)}</td>
                <td className="p-2 flex items-center gap-2">
                  <button onClick={() => onSelect(r)} className="px-2 py-1 rounded bg-black text-white dark:bg-white dark:text-black text-xs">Edit</button>
                  <a href={`/dev/blog/${r.slug}`} className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-xs">View</a>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="p-3 text-neutral-500" colSpan={6}>No posts yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
