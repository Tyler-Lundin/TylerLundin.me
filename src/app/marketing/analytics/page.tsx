import AnalyticsOverview from '@/components/ops/AnalyticsOverview'

export default async function MarketingAnalyticsPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">Analytics</h1>
        <AnalyticsOverview />
      </div>
    </div>
  )
}

