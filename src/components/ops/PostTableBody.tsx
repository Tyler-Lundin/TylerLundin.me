"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Trash2, Edit, ExternalLink } from 'lucide-react'
import { deletePostAction } from '@/app/dev/actions/blog'

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

type ContextMenuState = {
  visible: boolean
  x: number
  y: number
  postId: string | null
  postSlug: string | null
}

export default function PostTableBody({ posts, base }: { posts: PostRow[]; base: string }) {
  const router = useRouter()
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, postId: null, postSlug: null })
  const menuRef = useRef<HTMLDivElement>(null)

  const onRowClick = (href: string) => () => router.push(href)
  const stop = (e: React.MouseEvent) => { e.stopPropagation() }

  const handleContextMenu = (e: React.MouseEvent, postId: string, postSlug: string) => {
    e.preventDefault()
    e.stopPropagation()

    const menuWidth = 180
    const menuHeight = 140
    let x = e.clientX
    let y = e.clientY

    if (x + menuWidth > window.innerWidth) {
      x -= menuWidth
    }
    if (y + menuHeight > window.innerHeight) {
      y -= menuHeight
    }

    setContextMenu({
      visible: true,
      x,
      y,
      postId,
      postSlug
    })
  }

  const handleDelete = async () => {
    if (!contextMenu.postId) return
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return

    const formData = new FormData()
    formData.append('id', contextMenu.postId)
    const res = await deletePostAction(null, formData)
    
    if (res?.success) {
      router.refresh()
    }
    setContextMenu({ ...contextMenu, visible: false })
  }

  const handleEdit = () => {
    if (!contextMenu.postSlug) return
    router.push(`${base}/blog/${contextMenu.postSlug}`)
    setContextMenu({ ...contextMenu, visible: false })
  }

  const handleView = () => {
    if (!contextMenu.postSlug) return
    window.open(`/blog/${contextMenu.postSlug}`, '_blank')
    setContextMenu({ ...contextMenu, visible: false })
  }

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu({ ...contextMenu, visible: false })
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [contextMenu])

  return (
    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
      {posts.map((p) => (
        <tr
          key={p.id}
          onClick={onRowClick(`${base}/blog/${p.slug}`)}
          onContextMenu={(e) => handleContextMenu(e, p.id, p.slug)}
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

      {/* Context Menu Overlay */}
      {contextMenu.visible && (
        <div 
          ref={menuRef}
          className="fixed z-[100] min-w-[180px] overflow-hidden rounded-xl border border-neutral-200 bg-white/90 p-1.5 shadow-2xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button 
            onClick={handleEdit}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Edit className="size-4 opacity-70" />
            Edit Post
          </button>
          <button 
            onClick={handleView}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <ExternalLink className="size-4 opacity-70" />
            View Live
          </button>
          <div className="my-1 h-px bg-neutral-100 dark:bg-neutral-800" />
          <button 
            onClick={handleDelete}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            <Trash2 className="size-4" />
            Delete Post
          </button>
        </div>
      )}
    </tbody>
  )
}

