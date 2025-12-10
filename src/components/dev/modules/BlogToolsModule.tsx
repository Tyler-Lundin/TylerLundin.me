"use client"

import dynamic from 'next/dynamic'
import Link from 'next/link'

const BlogDashboard = dynamic(() => import('../blog/BlogDashboard'), { ssr: false })

export default function BlogToolsModule() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Blog Tools</h2>
        <div className="flex items-center gap-2">
          <Link href="/dev/blog/moderation" className="px-3 py-2 rounded bg-neutral-200 dark:bg-neutral-800 text-sm">Moderation Queue</Link>
          <Link href="/dev/blog/wizard" className="px-3 py-2 rounded bg-black text-white dark:bg-white dark:text-black text-sm">Open Full Wizard</Link>
        </div>
      </div>
      <BlogDashboard />
    </div>
  )
}
