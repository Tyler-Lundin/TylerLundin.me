"use client"
import Image from 'next/image'
export type PostCardData = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  cover_image_url?: string | null
  tags?: string[]
  published_at?: string | null
}

export default function PostCard({ post }: { post: PostCardData }) {
  return (
    <a href={`/blog/${post.slug}`} className="group block rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 hover:shadow-lg transition-shadow">
      <div className="relative aspect-[16/9]">
        {post.cover_image_url ? (
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-pink-500/40" />
        )}
      </div>
      <div className="p-3">
        <h4 className="text-base font-semibold line-clamp-1">{post.title}</h4>
        {post.excerpt && <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 mt-1">{post.excerpt}</p>}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[11px] rounded-full px-2 py-0.5 bg-black/5 dark:bg-white/10">#{t}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
