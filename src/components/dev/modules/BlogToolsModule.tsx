"use client"

import Link from 'next/link'

export default function BlogToolsModule() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Blog</h2>
          <div className="text-xs opacity-70">Manage posts, drafts, and comments</div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dev/blog/wizard" className="px-3 py-2 rounded bg-black text-white dark:bg-white dark:text-black text-sm">Create New</Link>
          <Link href="/dev/blog/moderation" className="px-3 py-2 rounded bg-neutral-200 dark:bg-neutral-800 text-sm">Moderation</Link>
        </div>
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm opacity-80">Open the Blog Manager to view posts, filter, and manage content.</div>
          <Link href="/dev/blog" className="px-3 py-2 rounded bg-black text-white dark:bg-white dark:text-black text-sm">Open Blog Manager</Link>
        </div>
      </div>
    </div>
  )
}
