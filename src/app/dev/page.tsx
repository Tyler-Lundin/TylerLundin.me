import Link from 'next/link'

export default function DevDashboard() {
  return (
    <div className="min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-6 mt-6">
          <h1 className="text-xl font-semibold">Dev Home</h1>
          <p className="text-sm opacity-70 mt-1">Quick links</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/dev/blog" className="rounded-md border border-black/10 dark:border-white/10 p-3 hover:bg-black/5 dark:hover:bg-white/10">
              <div className="font-medium">Blog Manager</div>
              <div className="text-xs opacity-70">View posts, filter, create new</div>
            </Link>
            <Link href="/dev/blog/wizard" className="rounded-md border border-black/10 dark:border-white/10 p-3 hover:bg-black/5 dark:hover:bg-white/10">
              <div className="font-medium">Create New Post</div>
              <div className="text-xs opacity-70">Open the blog wizard</div>
            </Link>
            <Link href="/dev/msgs" className="rounded-md border border-black/10 dark:border-white/10 p-3 hover:bg-black/5 dark:hover:bg-white/10">
              <div className="font-medium">Inbox</div>
              <div className="text-xs opacity-70">Messages and notifications</div>
            </Link>
            <Link href="/dev/blog/moderation" className="rounded-md border border-black/10 dark:border-white/10 p-3 hover:bg-black/5 dark:hover:bg-white/10">
              <div className="font-medium">Comment Moderation</div>
              <div className="text-xs opacity-70">Approve or delete comments</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
