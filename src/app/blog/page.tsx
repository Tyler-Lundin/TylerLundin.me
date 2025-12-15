import type { Metadata } from 'next'
import SpotlightPosts, { type BlogSpotlightItem } from '@/components/blog/SpotlightPosts'
import PostCard, { type PostCardData } from '@/components/blog/PostCard'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

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

  return (
    <main className="max-w-screen mx-1 md:mx-4 border border-black/10 dark:border-white/10 rounded-lg py-4 my-4 min-h-screen overflow-visible bg-gradient-to-b from-neutral-50 dark:from-black z-10 via-transparent to-white dark:to-black text-black dark:text-white ">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black">Blog</h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 mt-2">Long-form notes on code, training, and life.</p>
        </div>

        {/* Rotating spotlight hero, similar to projects */}
        <SpotlightPosts posts={spotlight} />

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
