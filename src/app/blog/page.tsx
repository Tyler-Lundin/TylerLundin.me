import type { Metadata } from 'next'
import { ensureProfileOrRedirect } from '@/lib/profile'
import SpotlightPosts, { type BlogSpotlightItem } from '@/components/blog/SpotlightPosts'
import PostCard, { type PostCardData } from '@/components/blog/PostCard'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'
import BlogBillboard from '@/components/billboard/BlogBillboard'

export const metadata: Metadata = {
  title: 'Blog | Tyler Lundin',
  description: 'Blog posts and updates.'
}

export default async function BlogPage() {
  await ensureProfileOrRedirect()
  const sb: any = await createClient()
  const sbAdmin: any = await createServiceClient()
  // Use the public aggregation view
  const { data } = await sb
    .from('blog_posts_public' as any)
    .select('*')
    .order('published_at', { ascending: false })
    .limit(24)

  const posts = (data || []) as any[]

  // Build author map for small signature
  const slugs = posts.map((p: any) => p.slug).filter(Boolean)
  const authorBySlug: Record<string, { name: string | null; avatar: string | null }> = {}
  if (slugs.length) {
    const { data: baseRows } = await sb
      .from('blog_posts')
      .select('slug, author_id')
      .in('slug', slugs)
      .eq('status', 'published')
    const byId: Record<string, string[]> = {}
    for (const r of baseRows || []) {
      if (r.author_id && r.slug) {
        byId[r.author_id] = byId[r.author_id] || []
        byId[r.author_id].push(r.slug)
      }
    }
    const authorIds = Object.keys(byId)
    if (authorIds.length) {
      // Use service client for author details to avoid RLS issues
      const { data: users } = await sbAdmin.from('users').select('id, full_name').in('id', authorIds)
      const { data: profiles } = await sbAdmin.from('user_profiles').select('user_id, avatar_url').in('user_id', authorIds)
      const userById: Record<string, any> = {}
      for (const u of users || []) userById[u.id] = u
      const profById: Record<string, any> = {}
      for (const p of profiles || []) profById[p.user_id] = p
      for (const aid of authorIds) {
        const u = userById[aid]
        const p = profById[aid]
        const name = (u?.full_name ?? null) as string | null
        const avatar = p?.avatar_url || null
        for (const slug of byId[aid] || []) authorBySlug[slug] = { name, avatar }
      }
    }
  }

  const spotlight: BlogSpotlightItem[] = posts.slice(0, 6).map((p) => ({
    id: randomUUID(),
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_image_url: p.cover_image_url,
    published_at: p.published_at,
  }))

  const toCard = (p: any): PostCardData => ({
    id: randomUUID(),
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_image_url: p.cover_image_url,
    tags: p.tags ?? [],
    published_at: p.published_at,
    authorName: authorBySlug[p.slug]?.name || null,
    authorAvatarUrl: authorBySlug[p.slug]?.avatar || null,
  })

  // Segment by simple categories via tags
  const byTag = (name: string) => posts.filter((p: any) => (p.tags || []).map((t: string) => t.toLowerCase()).includes(name))
  const tech = byTag('tech').slice(0, 8)
  const fitness = byTag('fitness').slice(0, 8)
  const personal = byTag('personal').slice(0, 8)

  const themeKey: BillboardThemeKeyFromConfig = themeConfig.billboard.themeKey

  return (
    <main
      className={[
        'max-w-full overflow-x-hidden mx-2 md:mx-4 my-4 rounded-2xl',
        'border border-black/10 dark:border-white/10',
        'p-2 sm:p-3 md:p-4 lg:p-8',
        billboardThemes[themeKey].wrap,
        'text-black dark:text-white',
      ].join(' ')}
    >
        <BlogBillboard
          headline="Tyler's Notes"
          description="Web dev, gym, and whatever else I'm thinking about lately."
          themeKey={themeKey}
        />            {/* Rotating spotlight hero, similar to projects */}

      <div className="mx-auto max-w-5xl my-8">
        <SpotlightPosts posts={spotlight} />
        {/* Segments */}
        <div className=" space-y-10">
          {tech.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Tech</h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tech.map((p: any) => (
                  <PostCard key={randomUUID()} post={toCard(p)} />
                ))}
              </div>
            </section>
          )}

          {fitness.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Fitness</h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {fitness.map((p: any) => (
                  <PostCard key={randomUUID()} post={toCard(p)} />
                ))}
              </div>
            </section>
          )}

          {personal.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Personal</h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {personal.map((p: any) => (
                  <PostCard key={randomUUID()} post={toCard(p)} />
                ))}
              </div>
            </section>
          )}

          {/* Fallback "All" if any remain not categorized */}
          {posts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Latest</h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {posts.slice(0, 12).map((p: any) => (
                  <PostCard key={randomUUID()} post={toCard(p)} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
