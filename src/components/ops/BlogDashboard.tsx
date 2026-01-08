import Link from 'next/link'
import PostTableBody from './PostTableBody'
import { createServiceClient } from '@/lib/supabase/server'

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

const Icons = {
  Plus: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Search: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Eye: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Edit: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
}

async function fetchPosts(): Promise<PostRow[]> {
  const sb = await createServiceClient()
  const { data, error } = await sb
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, status, updated_at, published_at, reading_time_minutes')
    .order('updated_at', { ascending: false })
  if (error) throw error
  const posts = (data || []) as PostRow[]
  const withCounts: PostRow[] = []
  for (const p of posts) {
    const { count } = await sb
      .from('blog_post_views')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', p.id)
    withCounts.push({ ...p, views_count: count || 0 })
  }
  return withCounts
}

function StatusBadge({ status }: { status: PostRow['status'] }) {
  const styles: Record<string, string> = {
    published: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    draft:     'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    archived:  'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700',
  }
  const style = styles[status] || styles.draft
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${style}`}>{status}</span>
}

function KpiCard({ title, value, icon }: { title: string, value: string | number, icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{title}</span>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</div>
      </div>
    </div>
  )
}

function PostTable({ posts, base }: { posts: PostRow[]; base: string }) {
  if (posts.length === 0) return <div className="p-8 text-center text-sm text-neutral-500">No posts found matching criteria.</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          <tr>
            <th className="px-6 py-3 font-medium">Post Title</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium text-right">Views</th>
            <th className="px-6 py-3 font-medium text-right">Updated</th>
            <th className="px-6 py-3 font-medium"></th>
          </tr>
        </thead>
        {/* Client-side body to enable row click navigation */}
        <PostTableBody posts={posts} base={base} />
      </table>
    </div>
  )
}

export default async function BlogDashboard({ base = '/dev', searchParams }: { base?: string; searchParams?: Promise<{ q?: string; status?: string }> }) {
  const sp = (await searchParams) || {}
  const q = (sp.q || '').toLowerCase()
  const statusFilter = sp.status || ''

  const allPosts = await fetchPosts()
  const totalViews = allPosts.reduce((acc, p) => acc + (p.views_count || 0), 0)
  const publishedCount = allPosts.filter(p => p.status === 'published').length
  const draftCount = allPosts.filter(p => p.status === 'draft').length

  const filtered = allPosts.filter((p) => {
    const okStatus = !statusFilter || p.status === statusFilter
    const okQ = !q || (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q)
    return okStatus && okQ
  })

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Blog Management</h1>
          <p className="text-sm text-neutral-500">Manage posts, track views, and handle drafts</p>
        </div>
        <Link href={`${base}/blog/wizard`} className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
          <Icons.Plus /> Create New
        </Link>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Total Views" value={totalViews.toLocaleString()} icon={<Icons.Eye />} />
        <KpiCard title="Published" value={publishedCount} icon={<span className="flex size-2 rounded-full bg-emerald-500" />} />
        <KpiCard title="Drafts" value={draftCount} icon={<span className="flex size-2 rounded-full bg-amber-500" />} />
      </section>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400"><Icons.Search /></div>
              <input name="q" defaultValue={q} placeholder="Search posts..." className="block w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-600 dark:focus:bg-neutral-950" />
            </div>
            <select name="status" defaultValue={statusFilter} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900">
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <button className="rounded-lg border px-3 py-2 text-sm">Apply</button>
          </form>
        </div>
        <PostTable posts={filtered} base={base} />
      </div>
    </>
  )
}
