import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ensureProfileOrRedirect } from '@/lib/profile'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SidebarAds from '@/components/blog/SidebarAds'
import CommentsClient from './CommentsClient'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'

type PublicPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_image_url: string | null
  content_md?: string | null
  published_at: string | null
  tags?: string[] | null
  author_id?: string | null
  author?: { id: string; full_name: string | null; avatar_url: string | null; role: string | null; visibility: 'public' | 'private' }
}

async function getPost(slug: string): Promise<PublicPost | null> {
  const sb: any = await createClient()
  const sbAdmin: any = await createServiceClient()
  // Prefer public view (aggregated), then load full post body from base table
  const { data: pub } = await sb
    .from('blog_posts_public')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!pub) return null

  // Fetch full markdown body from base table (limited to published only)
  const { data: base } = await sb
    .from('blog_posts')
    .select('content_md, author_id')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  let author: PublicPost['author'] = undefined
  const author_id = base?.author_id || null
  if (author_id) {
    // Use service client to fetch minimal author details even if profile is private
    const { data: u } = await sbAdmin.from('users').select('id, full_name, role').eq('id', author_id).maybeSingle()
    const { data: p } = await sbAdmin.from('user_profiles').select('avatar_url, visibility').eq('user_id', author_id).maybeSingle()
    if (u) {
      author = {
        id: u.id,
        full_name: u.full_name,
        avatar_url: p?.avatar_url || null,
        role: u.role,
        visibility: (p?.visibility as any) || 'public',
      }
    }
  }

  return {
    id: pub.id,
    slug: pub.slug,
    title: pub.title,
    excerpt: pub.excerpt ?? null,
    cover_image_url: pub.cover_image_url ?? null,
    content_md: base?.content_md ?? null,
    published_at: pub.published_at ?? null,
    tags: pub.tags ?? [],
    author_id,
    author,
  }
}

async function recordView(postId: string) {
  try {
    const sb = await createClient()
    const h = await headers()
    const ua = h.get('user-agent') || ''
    const ip = h.get('x-forwarded-for') || ''
    const viewer_hash = Buffer.from(`${ip}|${ua}`).toString('base64').slice(0, 120)
    await sb.from('blog_post_views').insert({ post_id: postId, viewer_hash })
  } catch {}
}

export default async function PublicBlogPost({ params }: { params: Promise<{ slug: string }> }) {
  await ensureProfileOrRedirect()
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return notFound()
  // fire-and-forget view record
  recordView(post.id)

  return (
    <main className="max-w-full overflow-x-hidden mx-2 md:mx-4 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit overflow-visible bg-gradient-to-b from-neutral-50 dark:from-black z-10 via-transparent to-white dark:to-black text-black dark:text-white ">
      <div className="mx-auto max-w-7xl sm:px-4 py-10 sm:py-16 ">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-4">
          {/* Main */}
          <article className="lg:col-span-3">
            <header className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{post.title}</h1>
              {post.excerpt && (
                <p className="mt-2 text-neutral-700 dark:text-neutral-300">{post.excerpt}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                {post.published_at && <span>Published {new Date(post.published_at).toLocaleDateString()}</span>}
                {post.tags && post.tags.length > 0 && (
                  <span className="opacity-60">•</span>
                )}
                {post.tags?.map((t) => (
                  <span key={t} className="rounded-full px-2 py-0.5 bg-black/5 dark:bg-white/10">#{t}</span>
                ))}
              </div>
            </header>

            {post.author && (
              <div className="flex items-center gap-3 mb-6">
                {post.author.visibility === 'public' ? (
                  <a href={`/profile/${post.author.id}`} className="flex items-center gap-3">
                    <img src={post.author.avatar_url && post.author.avatar_url.trim() ? post.author.avatar_url : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.author.full_name || 'Author')}`}
                         alt="avatar" className="h-8 w-8 rounded-full object-cover border border-black/10 dark:border-white/10" />
                    <div className="text-sm">
                      <div className="font-medium">{post.author.full_name || 'Author'}</div>
                      {post.author.role && <div className="text-xs text-neutral-500">{post.author.role}</div>}
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3">
                    <img src={post.author.avatar_url && post.author.avatar_url.trim() ? post.author.avatar_url : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.author.full_name || 'Author')}`}
                         alt="avatar" className="h-8 w-8 rounded-full object-cover border border-black/10 dark:border-white/10" />
                    <div className="text-sm">
                      <div className="font-medium">{post.author.full_name || 'Author'}</div>
                      {post.author.role && <div className="text-xs text-neutral-500">{post.author.role}</div>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {post.cover_image_url && (
              <div className="relative w-full h-[420px] rounded-xl overflow-hidden mb-6">
                <img src={post.cover_image_url} alt="cover" className="absolute inset-0 w-full h-full blog-pan-vert" />
              </div>
            )}

            <div className="prose prose-lg dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content_md || ''}
              </ReactMarkdown>
            </div>

            <CommentsClient postId={post.id} />
          </article>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SidebarAds />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
