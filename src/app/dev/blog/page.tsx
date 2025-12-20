import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import { headers } from 'next/headers'

type PostRow = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  cover_image_url?: string | null
  status: 'draft' | 'published' | 'archived'
  updated_at?: string | null
  published_at?: string | null
  reading_time_minutes?: number | null
  views_count?: number
}

async function fetchPosts(): Promise<PostRow[]> {
  const sb: any = await createServiceClient()
  const { data, error } = await sb
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, status, updated_at, published_at, reading_time_minutes')
    .order('updated_at', { ascending: false })
  if (error) throw error
  const posts = Array.isArray(data) ? data : []
  const withCounts: any[] = []
  for (const p of posts as any[]) {
    const { count } = await sb
      .from('blog_post_views')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', p.id)
    withCounts.push({ ...p, views_count: count || 0 })
  }
  return withCounts as PostRow[]
}

function StatusBadge({ status }: { status: PostRow['status'] }) {
  const tone = status === 'published' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-700/20'
    : status === 'draft' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-700/20'
    : 'bg-neutral-500/15 text-neutral-700 dark:text-neutral-300 border-neutral-700/20'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${tone}`}>{status}</span>
}

function Toolbar() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white">Blog</h1>
        <div className="text-xs text-[#949BA4]">Manage posts and drafts</div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/dev/blog/wizard" className="px-3 py-2 rounded bg-[#5865F2] text-white text-sm">Create New</Link>
        <Link href="/dev" className="px-3 py-2 rounded bg-[#383A40] text-[#DBDEE1] text-sm">Back</Link>
      </div>
    </div>
  )
}

function Filters({ q, status }: { q: string; status: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input name="q" defaultValue={q} placeholder="Search title…" className="flex-1 rounded border border-[#3F4147] bg-[#1E1F22] placeholder-[#949BA4] px-3 py-2 text-sm text-[#DBDEE1]" />
      <select name="status" defaultValue={status} className="rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]">
        <option value="">All</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>
      <button type="submit" className="px-3 py-2 rounded bg-[#5865F2] text-white text-sm">Apply</button>
    </div>
  )
}

function truncate(s: string, n = 80) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

function CardRow({ p }: { p: PostRow }) {
  return (
    <li className="flex items-center gap-3 p-3 border-b border-[#1F2124]">
      <div className="w-14 h-10 bg-[#3F4147] rounded overflow-hidden shrink-0">
        {p.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover_image_url} alt="thumb" className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/dev/blog/${p.slug}`} className="font-medium truncate text-white hover:underline">
            {truncate(p.title || p.slug, 70)}
          </Link>
          <StatusBadge status={p.status} />
        </div>
        <div className="text-xs text-[#949BA4] truncate">{truncate(p.excerpt || '', 120)}</div>
      </div>
      <div className="text-right shrink-0 w-24">
        <div className="text-[11px] text-[#949BA4]">Views</div>
        <div className="text-sm font-semibold text-white">{p.views_count ?? 0}</div>
      </div>
    </li>
  )
}

export default async function DevBlogIndex({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  try { await requireAdmin() } catch { return null }
  const sp = (await searchParams) || {}
  const q = (sp.q || '').toLowerCase()
  const status = sp.status || ''
  const posts = await fetchPosts()
  const filtered = posts.filter((p) => {
    const okStatus = !status || p.status === status
    const okQ = !q || (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q)
    return okStatus && okQ
  })

  return (
    <main className="min-h-screen bg-[#313338] py-20">
      <div className="mx-auto max-w-6xl px-4 space-y-4 text-[#DBDEE1]">
        <Toolbar />
        <form action="" className="rounded-lg border border-[#1F2124] bg-[#2B2D31] p-3">
          <Filters q={sp.q || ''} status={status} />
        </form>
        <div className="rounded-lg border border-[#1F2124] bg-[#2B2D31] overflow-hidden">
          <ul>
            <Suspense fallback={<li className="p-3 text-sm opacity-70">Loading…</li>}>
              {filtered.map((p) => (
                <CardRow key={p.id} p={p} />
              ))}
              {filtered.length === 0 && (
                <li className="p-4 text-sm opacity-70">No posts found.</li>
              )}
            </Suspense>
          </ul>
        </div>
      </div>
    </main>
  )
}
