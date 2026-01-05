import BlogDashboard from '@/components/ops/BlogDashboard'

export default async function MarketingBlogIndex({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  return (
    <main className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <BlogDashboard base="/marketing" searchParams={searchParams} />
      </div>
    </main>
  )
}
