import type { Metadata } from 'next'
import SpotlightPosts, { type BlogSpotlightItem } from '@/components/blog/SpotlightPosts'
import PostCard, { type PostCardData } from '@/components/blog/PostCard'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'
import BlogBillboard from '@/components/billboard/BlogBillboard'

export const metadata: Metadata = {
  title: 'Blog | Tyler Lundin',
  description: 'Blog posts and updates.'
}

export default async function BlogPage() {
  const sb = await createClient()
  // Use the public aggregation view
  const { data } = await sb
    .from('blog_posts_public' as any)
    .select('*')
    .order('published_at', { ascending: false })
    .limit(24)

  const posts = (data || []) as any[]

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
        billboardThemes[themeKey].wrap,
        'text-black dark:text-white',
      ].join(' ')}
    >
      <section className="relative py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <BlogBillboard
            headline="Blog"
            description="Long-form notes on code, training, and life."
            themeKey={themeKey}
          />
          <div className="mt-8 sm:mt-10">
            {/* Rotating spotlight hero, similar to projects */}
            <SpotlightPosts posts={spotlight} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {/* Segments */}
        <div className="mt-12 space-y-10">
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
