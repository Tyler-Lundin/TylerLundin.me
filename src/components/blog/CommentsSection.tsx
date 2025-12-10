"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type CommentRow = {
  id: string
  author_name: string | null
  author_email: string | null
  website_url: string | null
  content: string
  created_at: string
}

export default function CommentsSection({ postId }: { postId: string }) {
  const supabase = createClient()
  const [comments, setComments] = useState<CommentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [content, setContent] = useState('')
  const [hp, setHp] = useState('') // honeypot
  const [startedAt] = useState<string>(new Date().toISOString())

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('blog_comments')
          .select('id, author_name, author_email, website_url, content, created_at')
          .eq('post_id', postId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
        if (error) throw error
        setComments(data || [])
      } catch (e: any) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [postId, supabase])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, author_name: authorName, author_email: authorEmail, website_url: websiteUrl, content, hp, startedAt }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to submit')
      setSubmitted(true)
      setAuthorName('')
      setAuthorEmail('')
      setWebsiteUrl('')
      setContent('')
    } catch (e: any) {
      setError(e?.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="comments" className="mt-10">
      <h2 className="text-xl font-semibold mb-3">Comments</h2>

      {/* List */}
      {!loading && comments.length > 0 && (
        <ul className="space-y-4 mb-8">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md border border-black/10 dark:border-white/10 p-3 bg-white/60 dark:bg-neutral-900/60">
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{c.content}</div>
              <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                <span>{c.author_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Form */}
      <div className="rounded-md border border-black/10 dark:border-white/10 p-4 bg-white/70 dark:bg-neutral-900/70">
        <h3 className="text-sm font-medium mb-3">Add a comment</h3>
        {submitted ? (
          <div className="text-sm text-emerald-600 dark:text-emerald-400">Thanks! Your comment is pending review.</div>
        ) : (
          <form onSubmit={submit} className="grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2 text-sm"
                placeholder="Name (optional)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
              <input
                className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2 text-sm"
                placeholder="Email (optional, not published)"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
              />
            </div>
            <input
              className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2 text-sm"
              placeholder="Website (optional)"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
            {/* Honeypot field, hidden visually but present for bots */}
            <div aria-hidden="true" className="hidden">
              <label>
                Company
                <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
              </label>
            </div>
            <textarea
              required
              rows={4}
              className="rounded-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 px-3 py-2 text-sm"
              placeholder="Share your thoughts…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {error && <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>}
            <div>
              <button
                type="submit"
                disabled={submitting || content.trim().length === 0}
                className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Comment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )}
