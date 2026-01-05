"use client"

import Image from 'next/image'
import Link from 'next/link'

export type PostCardData = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  cover_image_url?: string | null
  tags?: string[]
  published_at?: string | null
  authorName?: string | null
  authorAvatarUrl?: string | null
}

// Helper to format dates cleanly (e.g., "Jan 4, 2026")
const formatDate = (dateString?: string | null) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PostCard({ post }: { post: PostCardData }) {
  const formattedDate = formatDate(post.published_at)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-neutral-100 dark:hover:shadow-neutral-900/50 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
        )}
        
        {/* Optional: Floating Badge for the first tag */}
        {post.tags && post.tags.length > 0 && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase text-neutral-800 dark:text-neutral-200 shadow-sm">
            {post.tags[0]}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow p-5">
        
        {/* Date & Read Time (Optional placeholder) */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
           {formattedDate && <time dateTime={post.published_at || ''}>{formattedDate}</time>}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Footer: Author info pushes to bottom */}
        <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative h-6 w-6 rounded-full overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-700 bg-neutral-100">
              <img
                src={
                  post.authorAvatarUrl && post.authorAvatarUrl.trim()
                    ? post.authorAvatarUrl
                    : `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(post.authorName || 'Author')}`
                }
                alt={post.authorName || 'Author'}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {post.authorName || 'Anonymous'}
            </span>
          </div>
          
          {/* Arrow Icon on Hover */}
          <span className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
