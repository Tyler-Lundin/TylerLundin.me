import { requireAdmin } from '@/lib/auth'
import BlogDashboard from '@/components/ops/BlogDashboard'

export default async function DevBlogIndex({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  try { await requireAdmin() } catch { return null }
  return (
    <main className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <BlogDashboard base="/dev" searchParams={searchParams} />
      </div>
    </main>
  )
}

