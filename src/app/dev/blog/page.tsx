import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'

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

// --- Icons ---
const Icons = {
  Plus: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Search: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  FileText: () => <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
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

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${style}`}>
      {status}
    </span>
  )
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

function PostTable({ posts }: { posts: PostRow[] }) {
  if (posts.length === 0) {
    return <div className="p-8 text-center text-sm text-neutral-500">No posts found matching criteria.</div>
  }

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
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {posts.map((p) => (
            <tr key={p.id} className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                    {p.cover_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">{p.title || '(Untitled)'}</div>
                    <div className="text-xs text-neutral-500 truncate max-w-[200px]">{p.slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-6 py-4 text-right font-medium text-neutral-900 dark:text-white tabular-nums">
                {p.views_count?.toLocaleString() ?? 0}
              </td>
              <td className="px-6 py-4 text-right text-xs text-neutral-500 tabular-nums">
                {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '–'}
              </td>
              <td className="px-6 py-4 text-right">
                <Link 
                  href={`/dev/blog/${p.slug}`}
                  className="inline-flex items-center justify-center rounded-md p-2 text-neutral-400 hover:bg-white hover:text-neutral-900 hover:shadow-sm dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <Icons.Edit />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function DevBlogIndex({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  try { await requireAdmin() } catch { return null }
  const sp = (await searchParams) || {}
  const q = (sp.q || '').toLowerCase()
  const statusFilter = sp.status || ''

  const allPosts = await fetchPosts()
  
  // Calculate Stats
  const totalViews = allPosts.reduce((acc, p) => acc + (p.views_count || 0), 0)
  const publishedCount = allPosts.filter(p => p.status === 'published').length
  const draftCount = allPosts.filter(p => p.status === 'draft').length

  // Filter
  const filtered = allPosts.filter((p) => {
    const okStatus = !statusFilter || p.status === statusFilter
    const okQ = !q || (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q)
    return okStatus && okQ
  })

  return (
    <main className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Blog Management</h1>
            <p className="text-sm text-neutral-500">Manage posts, track views, and handle drafts</p>
          </div>
          <Link href="/dev/blog/wizard" className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
            <Icons.Plus /> Create New
          </Link>
        </div>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard title="Total Views" value={totalViews.toLocaleString()} icon={<Icons.Eye />} />
          <KpiCard title="Published" value={publishedCount} icon={<span className="flex size-2 rounded-full bg-emerald-500" />} />
          <KpiCard title="Drafts" value={draftCount} icon={<span className="flex size-2 rounded-full bg-amber-500" />} />
        </section>

        {/* Main Content */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          
          {/* Toolbar */}
          <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Icons.Search />
                </div>
                <input 
                  name="q" 
                  defaultValue={q} 
                  placeholder="Search posts..." 
                  className="block w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-600"
                />
              </div>
              <select 
                name="status" 
                defaultValue={statusFilter}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <button type="submit" className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
                Filter
              </button>
            </form>
          </div>

          {/* Table */}
          <Suspense fallback={<div className="p-8 text-center text-sm opacity-70">Loading posts...</div>}>
            <PostTable posts={filtered} />
          </Suspense>
        </div>

      </div>
    </main>
  )
}

