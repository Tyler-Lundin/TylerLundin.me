import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PostViewActions from '@/components/dev/blog/PostViewActions'

type Post = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content_md: string | null
  cover_image_url: string | null
  status: 'draft' | 'published' | 'archived'
  reading_time_minutes: number | null
  published_at: string | null
  created_at: string
  updated_at: string
}

async function getData(slug: string) {
  const sb: any = await createServiceClient()
  const { data: post, error } = await sb
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !post) throw new Error('Post not found')

  const { data: tagRows } = await sb
    .from('blog_post_tags')
    .select('blog_tags(name, slug)')
    .eq('post_id', post.id)

  const tags: { name: string; slug: string }[] =
    (tagRows || [])
      .map((r: any) => r.blog_tags)
      .filter(Boolean)

  const { count: viewsCount } = await sb
    .from('blog_post_views')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post.id)

  const { count: commentsCount } = await sb
    .from('blog_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post.id)

  return { post: post as Post, tags, viewsCount: viewsCount || 0, commentsCount: commentsCount || 0 }
}

export default async function DevBlogView({ params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin()
  } catch {
    redirect('/login')
  }

  let data
  try {
    const { slug } = await params
    data = await getData(slug)
  } catch (e) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-md border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-neutral-900/60">
            <div className="text-sm">Post not found.</div>
            <div className="mt-3"><Link href="/dev" className="text-sm underline">Back to Dev</Link></div>
          </div>
        </div>
      </div>
    )
  }

  const { post, tags, viewsCount, commentsCount } = data

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 p-6 pb-32">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/dev" className="text-sm underline">← Back</Link>
          <div className="text-xs uppercase tracking-wide opacity-70">/dev · Blog</div>
        </div>

        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-300 max-w-3xl">{post.excerpt}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className={'rounded-full px-2 py-1 border ' + (post.status === 'published' ? 'border-emerald-500 text-emerald-700' : post.status === 'draft' ? 'border-amber-500 text-amber-700' : 'border-neutral-400 text-neutral-600')}>{post.status}</span>
                {post.published_at && <span className="opacity-70">Published: {new Date(post.published_at).toLocaleString()}</span>}
                <span className="opacity-70">Updated: {new Date(post.updated_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="opacity-70">Views</div>
              <div className="text-lg font-semibold">{viewsCount}</div>
              <div className="opacity-70 mt-2">Comments</div>
              <div className="text-lg font-semibold">{commentsCount}</div>
            </div>
          </div>

          {post.cover_image_url && (
            <div className="mt-4 relative rounded-md overflow-hidden w-full h-[420px]">
              {/* Subtle blog-specific vertical ping-pong using object-position */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image_url}
                alt="cover"
                className="absolute inset-0 w-full h-full blog-pan-vert"
              />
            </div>
          )}

          {tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t.slug} className="text-xs rounded-full px-2 py-1 bg-black/5 dark:bg-white/10">#{t.name}</span>
              ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-6 prose prose-lg dark:prose-invert max-w-3xl mx-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content_md || ''}
                </ReactMarkdown>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-3">
              <div className="rounded-md border border-black/10 dark:border-white/10 p-3 bg-white/60 dark:bg-neutral-900/60">
                <div className="text-xs uppercase opacity-70 mb-1">Metadata</div>
                <div className="text-xs opacity-80">Reading time: {post.reading_time_minutes ?? '—'} min</div>
                <div className="text-xs opacity-80">Slug: {post.slug}</div>
                <div className="text-xs opacity-80">Created: {new Date(post.created_at).toLocaleString()}</div>
                <div className="text-xs opacity-80">Updated: {new Date(post.updated_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <PostViewActions
          initial={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content_md: post.content_md,
            cover_image_url: post.cover_image_url,
            tags: tags?.map((t) => t.name) || [],
            reading_time_minutes: post.reading_time_minutes,
          }}
        />
      </div>
    </div>
  )
}
