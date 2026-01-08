import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Layers, Zap, ArrowUpRight, Box } from 'lucide-react'

import { getBundleBySlug, getServices, expandBundle, getBundles } from '@/services'
import BundleCard from '@/components/bundles/BundleCard'

type RouteParams = { 'bundle-slug': string }

export async function generateStaticParams() {
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
    <main
      className={[
        'max-w-full overflow-x-hidden mx-2 md:mx-4 my-4 rounded-2xl',
        'border border-black/10 dark:border-white/10',
        'text-black dark:text-white',
      ].join(' ')}
    >

      {/* ----------------------------------------------------------------------
          HERO SECTION (Split Layout)
          ---------------------------------------------------------------------- */}
      <section className="relative border-b border-neutral-200 dark:border-neutral-800">
        {/* Background Grid & Glow */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/80 via-transparent to-white dark:from-black/80 dark:to-black pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left: Copy & CTA */}
            <div className="flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-6">
                <Box className="w-3.5 h-3.5" />
                Service Bundle
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral-900 dark:text-white mb-4 text-balance">
                {bundle.title}
              </h1>

              <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mb-8">
                {bundle.summary}
              </p>

              {/* Price & Primary Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                <Link
                  href={contactHref}
                  className="group relative inline-flex items-center gap-2 justify-center rounded-xl py-3 px-8 text-sm font-bold transition-all duration-300 bg-neutral-900 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 dark:bg-white dark:text-black min-w-[160px]"
                >
                  <span>Start Project</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {bundle.priceRange && (
                  <div className="flex flex-col px-2">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Estimated Cost</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">{bundle.priceRange}</span>
                  </div>
                )}
              </div>

              {/* Tech Tags */}
              {Array.isArray(bundle.tags) && bundle.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {bundle.tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: The Visual (Bundle Card) */}
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 blur-2xl rounded-full opacity-60 animate-pulse" />
              <div className="relative transform transition-transform hover:scale-[1.02] duration-500">
                <BundleCard
                  item={bundle}
                  state="current"
                  ctaLabel="View Details" // Button inside card is decorative here since we have the main CTA
                  ctaHref={contactHref}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
          DETAILS SECTION (2 Col Layout)
          ---------------------------------------------------------------------- */}
      <section className="bg-neutral-50 dark:bg-black px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-12 max-w-7xl mx-auto">

          {/* MAIN CONTENT (Features & Process) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Features Grid */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">What’s Included</h2>
              </div>

              {Array.isArray(bundle.features) && bundle.features.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {bundle.features.map((f, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/50">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  This bundle includes a custom set of features tailored to your specific requirements.
                </p>
              )}
            </div>

            {/* Process Map */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Implementation Plan</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { step: "01", title: "Scope & Strategy", desc: "I define the exact deliverables and timeline." },
                  { step: "02", title: "Build & Refine", desc: "Development cycles with regular check-ins." },
                  { step: "03", title: "Launch & Support", desc: "Deployment, final testing, and hand-off." },
                ].map((s) => (
                  <div key={s.step} className="relative pl-4 border-l-2 border-neutral-200 dark:border-neutral-800">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mb-1 block">{s.step}</span>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">{s.title}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SIDEBAR (Included Services) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-6">
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6">
                <div className="flex items-center gap-2 mb-4 text-neutral-900 dark:text-white font-bold">
                  <Layers className="w-5 h-5 text-neutral-400" />
                  <h3>Service Stack</h3>
                </div>

                {expanded.services.length > 0 ? (
                  <ul className="space-y-3">
                    {expanded.services.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/services/${s.slug}`}
                          className="group block rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-black/40 p-3 hover:border-emerald-500/30 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {s.title}
                            </span>
                            <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-emerald-500" />
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                            {s.summary}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500">Custom combination of services.</p>
                )}
              </div>

              {/* Mini CTA Box */}
              <div className="mt-6 rounded-2xl bg-neutral-900 dark:bg-neutral-800 p-6 text-center text-white">
                <h3 className="font-bold text-sm mb-2">Ready to move forward?</h3>
                <p className="text-xs text-neutral-400 mb-4">Secure your slot on my calendar.</p>
                <Link href={contactHref} className="block w-full rounded-lg bg-white text-black py-2.5 text-sm font-bold hover:bg-neutral-200 transition-colors">
                  Book This Bundle
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </section>
    </main>
  )
}
