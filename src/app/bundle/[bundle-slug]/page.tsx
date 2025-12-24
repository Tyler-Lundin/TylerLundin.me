import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getBundleBySlug, getServices, expandBundle, getBundles } from '@/services'
import BundleCard from '@/components/bundles/BundleCard'

type RouteParams = { 'bundle-slug': string }

export async function generateStaticParams() {
  // Pre-render bundles for speed and SEO
  return getBundles().map((b) => ({ 'bundle-slug': b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { 'bundle-slug': slug } = await params
  const bundle = getBundleBySlug(slug)
  if (!bundle) return { title: 'Bundle not found' }
  return {
    title: `${bundle.title} | Bundle | Tyler Lundin`,
    description: bundle.summary,
    openGraph: {
      title: `${bundle.title} | Bundle | Tyler Lundin`,
      description: bundle.summary,
    },
  }
}

export default async function BundleDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { 'bundle-slug': slug } = await params
  const bundle = getBundleBySlug(slug)
  if (!bundle) return notFound()

  const expanded = expandBundle(bundle, getServices())
  const contactHref = `/contact?bundle=${encodeURIComponent(bundle.slug)}`

  return (
    <main className="max-w-7xl mx-2 md:mx-4 my-4 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/85 dark:bg-black/55 text-black dark:text-white">
      {/* Product-style hero with centered bundle card (keeps card aspect) */}
      <section className="relative p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="relative min-h-[500px] sm:min-h-[575px] md:min-h-[650px] mt-2 max-w-lg mx-auto">
            <BundleCard
              item={bundle}
              state="current"
              ctaHref={contactHref}
              ctaLabel="Get this bundle →"
            />
          </div>
          {/* Meta below the card */}
          <div className="mt-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold">{bundle.title}</h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-base text-neutral-700 dark:text-neutral-300">{bundle.summary}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              {bundle.priceRange ? (
                <span className="inline-flex items-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm font-semibold">
                  {bundle.priceRange}
                </span>
              ) : null}
              {Array.isArray(bundle.tags) && bundle.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {bundle.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-md border border-black/10 dark:border-white/10">#{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link href={contactHref} className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 bg-neutral-900 text-white dark:bg-white dark:text-black px-3 py-2 text-sm font-medium">Get this bundle</Link>
              <Link href="/services#bundles" className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm">Explore all bundles</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-10 py-8">
        <div className="grid gap-6 md:grid-cols-5">
          {/* What’s included */}
          <div className="md:col-span-3">
            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 p-5">
              <h2 className="text-base font-semibold">What’s included</h2>
              {Array.isArray(bundle.features) && bundle.features.length > 0 ? (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {bundle.features.map((f) => (
                    <li
                      key={f}
                      className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-200"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
                  This bundle includes multiple services tailored to your goals.
                </p>
              )}
            </div>

            {/* Process / reassurance */}
            <div className="mt-6 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 p-5">
              <h2 className="text-base font-semibold">How it works</h2>
              <ol className="mt-3 grid gap-2 sm:grid-cols-3 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="rounded-md border border-black/10 dark:border-white/10 p-3"><span className="font-medium">1. Scope</span><br />We confirm goals, pages, and priorities.</li>
                <li className="rounded-md border border-black/10 dark:border-white/10 p-3"><span className="font-medium">2. Build</span><br />Design and develop the required pieces.</li>
                <li className="rounded-md border border-black/10 dark:border-white/10 p-3"><span className="font-medium">3. Launch</span><br />Ship, measure, and iterate as needed.</li>
              </ol>
              <div className="mt-4">
                <Link href={contactHref} className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 bg-neutral-900 text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm font-medium">
                  Get a tailored estimate
                </Link>
              </div>
            </div>
          </div>

          {/* Services in this bundle */}
          <aside className="md:col-span-2">
            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 p-5">
              <h2 className="text-base font-semibold">Included services</h2>
              {expanded.services.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {expanded.services.map((s) => (
                    <li key={s.slug} className="rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium">
                          <Link href={`/services/${s.slug}`}>{s.title}</Link>
                        </h3>
                        {s.priceRange ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-600/20 text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-900/20 px-2 py-0.5 text-[11px]">
                            {s.priceRange}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[13px] text-neutral-700 dark:text-neutral-300 line-clamp-2">{s.summary}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
                  This bundle combines multiple services to match your scope.
                </p>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 p-4">
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                Questions or special requirements?
              </p>
              <div className="mt-2">
                <Link href={contactHref} className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 px-3 py-1.5 text-sm">
                  Ask about {bundle.title}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
