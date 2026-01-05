"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function PostTableBody({ posts, base }: { posts: PostRow[]; base: string }) {
  const router = useRouter()
  const onRowClick = (href: string) => () => router.push(href)
  const stop = (e: React.MouseEvent) => { e.stopPropagation() }

  return (
    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
      {posts.map((p) => (
        <tr
          key={p.id}
          onClick={onRowClick(`${base}/blog/${p.slug}`)}
          className="group cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
        >
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
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {p.status}
            </span>
          </td>
          <td className="px-6 py-4 text-right font-medium text-neutral-900 dark:text-white tabular-nums">{p.views_count?.toLocaleString() ?? 0}</td>
          <td className="px-6 py-4 text-right text-xs text-neutral-500 tabular-nums">{p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '–'}</td>
          <td className="px-6 py-4 text-right">
            <Link href={`${base}/blog/${p.slug}`} onClick={stop} className="inline-flex items-center justify-center rounded-md p-2 text-neutral-400 hover:bg-white hover:text-neutral-900 hover:shadow-sm dark:hover:bg-neutral-800 dark:hover:text-white">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </Link>
          </td>
        </tr>
      ))}
    </tbody>
  )
}

