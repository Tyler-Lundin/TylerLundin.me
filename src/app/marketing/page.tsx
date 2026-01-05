import Link from 'next/link'
import { ensureProfileOrRedirect } from '@/lib/profile'
import LeadsOverview from '@/components/ops/LeadsOverview'

function Card({ title, desc, href, cta }: { title: string; desc: string; href: string; cta: string }) {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{desc}</p>
      </div>
      <div className="mt-4">
        <Link href={href} className="inline-flex items-center rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
          {cta}
        </Link>
      </div>
    </div>
  )
}

export default async function MarketingDashboard() {
  await ensureProfileOrRedirect()
  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="mb-8">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Marketing Dashboard</h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Blog, analytics, leads, and messages in one place.</p>
        </section>

        {/* Leads Overview reused */}
        <section className="mb-8">
          <LeadsOverview />
        </section>

        {/* Quick Access */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Blog" desc="Drafts, posts, ideas, and moderation." href="/marketing/blog" cta="Open Blog" />
          <Card title="Analytics" desc="Traffic and engagement signals." href="/marketing/analytics" cta="Open Analytics" />
          <Card title="Leads (Swipe)" desc="Review and filter leads quickly." href="/marketing/leads/swipe" cta="Open Swipe" />
          <Card title="Groups" desc="Organize prospects by intent or campaign." href="/marketing/leads" cta="Manage Groups" />
          <Card title="Messages" desc="Customer and lead communications." href="/marketing/msgs" cta="Open Inbox" />
        </section>
      </div>
    </div>
  )
}
