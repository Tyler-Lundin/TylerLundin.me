import type { Metadata } from 'next'
import Link from 'next/link'
import { ServiceSublinks } from '@/components/services/ServiceSublinks'

export const metadata: Metadata = {
  title: 'FAQ & Pricing | Services | Tyler Lundin',
  description:
    'Answers to common web questions plus a clear breakdown of typical website costs and ongoing expenses.'
}

export default function ServicesFaqPage() {
  return (
    <main className="min-h-screen max-w-screen py-28 text-black dark:text-white">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="mb-6 h-[2px] w-20 bg-gradient-to-r from-neutral-300/70 via-neutral-400/40 to-transparent dark:from-neutral-600/70 dark:via-neutral-600/40" />

        <section className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur p-6 sm:p-8">
          <div className="mb-4">
            <span className="inline-block text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/60 border border-black/10 dark:border-white/10 px-2 py-0.5 rounded">
              Guide
            </span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight">FAQ & Pricing</h1>
          <p className="text-neutral-700 dark:text-neutral-300 mt-3">
            A quick overview of the moving pieces of the web—and what typical websites cost to build and run.
          </p>
          <p className="text-neutral-700 dark:text-neutral-300 mt-2 text-sm">
            Based in Spokane. If you’re searching locally, see my <a className="underline" href="/spokane-web-developer">Spokane web developer</a> page.
          </p>
        </section>

        {/* Moving Pieces */}
        <section className="mt-8 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-6">
          <h2 className="text-xl font-medium">Moving pieces of web development</h2>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            Most projects combine a few of these, depending on goals and complexity:
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              'Domain name and DNS',
              'Web hosting and CDN',
              'SSL and security hardening',
              'Design system and UI/UX',
              'Frontend development',
              'Backend/APIs and data',
              'CMS/blog and content workflows',
              'E‑commerce and payments',
              'Performance and SEO basics',
              'Accessibility (a11y) best practices',
              'Integrations (email, CRM, analytics)',
              'Ongoing maintenance and updates',
            ].map((item) => (
              <li
                key={item}
                className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Pricing Overview */}
        <section className="mt-6 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-6">
          <h2 className="text-xl font-medium">What does a website cost?</h2>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            It can range from $0 to $100,000+, depending on scope, features, and who builds it.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Cost by method</h3>
              <ul className="mt-2 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                <li><strong>DIY (Builders)</strong>: $0 – $200+/month. Templates, hosting, SSL included; basic plans ~ $10–$20/mo.</li>
                <li><strong>Freelancer/Small Agency</strong>: $1,000 – $10,000+ (simple sites from ~$1,500 up).</li>
                <li><strong>Custom Development (Agency)</strong>: $15,000 – $60,000+ for complex or enterprise needs.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Typical ongoing costs</h3>
              <ul className="mt-2 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                <li><strong>Domain</strong>: $10 – $25/year</li>
                <li><strong>Hosting</strong>: $5 – $500+/month</li>
                <li><strong>SSL</strong>: $0 – $100+/year (often free)</li>
                <li><strong>Themes/Templates</strong>: $0 – $200 one‑time</li>
                <li><strong>Plugins/Features</strong>: $0 – $500+/month</li>
                <li><strong>Content</strong>: $0 – $5,000+ (if outsourced)</li>
                <li><strong>Maintenance</strong>: $0 (DIY) – $200+/month</li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Cost by website type</h3>
            <ul className="mt-2 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
              <li><strong>Simple Blog/Portfolio</strong>: $100 – $1,000</li>
              <li><strong>Small Business Site</strong>: $1,000 – $5,000+</li>
              <li><strong>E‑commerce Store</strong>: $500 (basic platform) – $20,000+</li>
            </ul>
          </div>

          <div className="mt-6 rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-4 text-sm text-neutral-700 dark:text-neutral-300">
            Ranges vary widely based on features (e.g., booking, memberships, integrations), content, and design. If you share your goals, I can provide a clear scope and quote.
          </div>

          <div className="mt-6 flex">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-neutral-100/70 dark:bg-neutral-800/70 text-sm text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Get a tailored estimate
            </Link>
          </div>
        </section>

        <ServiceSublinks currentSlug="faq" />
      </div>
    </main>
  )
}
