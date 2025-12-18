import Link from 'next/link'
import {
  CloudflareIcon,
  PhotoshopIcon,
  SupabaseIcon,
  VercelIcon
} from '@/components/icons/BrandIcons'
import {
  LayoutDashboard,
  Shield,
  Database,
  PenTool,
  Check,
  Gauge,
  ShieldCheck,
  Wrench,
  Sparkles
} from 'lucide-react'
import type { Metadata } from 'next'
import { services, bundles } from '@/services'
import StickerParallax from '@/components/services/StickerParallax'
import SpotlightBundles from '@/components/services/SpotlightBundles'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'

export const metadata: Metadata = {
  title: 'Services | Tyler Lundin',
  description:
    'Web services offered: hosting, web design, logo design, custom dashboards and data, and authentication systems.'
}

export default function ServicesIndexPage() {
  const contactHref = (slug?: string) =>
    slug ? `/contact?service=${encodeURIComponent(slug)}` : '/contact'
  const iconSet = (slug: string) => {
    switch (slug) {
      case 'web-hosting':
        return [
          <VercelIcon key="vercel" className="text-black dark:text-white" />,
          <CloudflareIcon key="cf" />
        ]
      case 'web-design':
        return [
          <PhotoshopIcon key="ps" />,
          <PenTool
            key="pen"
            className="h-5 w-5 text-neutral-700 dark:text-neutral-300"
          />
        ]
      case 'logo-design':
        return [
          <PhotoshopIcon key="ps" />,
          <PenTool
            key="pen"
            className="h-5 w-5 text-neutral-700 dark:text-neutral-300"
          />
        ]
      case 'dashboards-data':
        return [
          <LayoutDashboard
            key="dash"
            className="h-5 w-5 text-neutral-700 dark:text-neutral-300"
          />,
          <Database
            key="db"
            className="h-5 w-5 text-neutral-700 dark:text-neutral-300"
          />,
          <SupabaseIcon key="sb" />
        ]
      case 'authentication':
        return [
          <Shield
            key="auth"
            className="h-5 w-5 text-neutral-700 dark:text-neutral-300"
          />,
          <SupabaseIcon key="sb" />
        ]
      default:
        return []
    }
  }

  const themeKey: BillboardThemeKeyFromConfig = themeConfig.billboard.themeKey

  const t = billboardThemes[themeKey]

  return (
    <main
      className={[
        'max-w-7xl overflow-x-hidden mx-2 md:mx-4 my-4 rounded-2xl',
        'border border-black/10 dark:border-white/10',
        t.wrap,
        'text-black dark:text-white',
      ].join(' ')}
    >
      <section className="relative py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <header className={['relative', t.panel].join(' ')}>
            <div className={t.overlay} />
            <div className="relative p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                <div className="min-w-0">
                  <div className={t.label}>
                    SERVICES
                    <span className="h-1 w-1 rounded-full bg-white/70" />
                    BILLBOARD
                  </div>
                  <h1 className={['mt-3 font-black tracking-tight leading-[1.02]', 'text-3xl sm:text-5xl', t.title].join(' ')}>
                    Services
                  </h1>
                  <p className={['mt-3 text-base sm:text-lg max-w-prose', t.desc].join(' ')}>
                    Hosting, design, logos, dashboards, and auth—wired together so your site runs fast,
                    looks sharp, and stays online.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <Link
                      href={contactHref()}
                      className={['inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold', 'bg-neutral-950 text-white dark:bg-white dark:text-black'].join(' ')}
                    >
                      Contact me
                      <span aria-hidden className="ml-1">→</span>
                    </Link>
                    <Link
                      href="/services/faq"
                      className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold border border-black/10 dark:border-white/10"
                    >
                      FAQ & Pricing
                    </Link>
                  </div>
                </div>
                <div className="shrink-0 flex justify-start sm:justify-end">
                  <div className="relative">
                    <div className={t.stickerGlow} />
                    <div className={['relative px-3 py-2', t.stickerPlate].join(' ')}>
                      <StickerParallax sticker="prepared" size={4} />
                    </div>
                  </div>

                  <div className="relative sm:hidden">
                    <div className={t.stickerGlow} />
                    <div className={['relative px-3 py-2 ', t.stickerPlate].join(' ')}>
                      <h1> Hello World, I am Tyler </h1>
                    </div>
                    <div className={['relative px-3 py-2 mt-2', t.stickerPlate].join(' ')}>
                      <h1> Below are just a few of my recent projects. </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
      </section>

      {/* FULL-WIDTH BUNDLES SHOWCASE */}
      <section className="my-6">
        <SpotlightBundles bundles={bundles} />
      </section>

      {/* FULL-WIDTH WHY IT WORKS */}
      <section className="mt-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-5">
            <h2 className="mb-2 text-base font-semibold">Why it works</h2>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex gap-2"><Gauge className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400" /><span>Performance-first builds — fast pages, good Core Web Vitals, fewer headaches.</span></li>
              <li className="flex gap-2"><ShieldCheck className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400" /><span>Secure hosting and auth — SSL, backups, monitoring, and sane defaults.</span></li>
              <li className="flex gap-2"><Sparkles className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400" /><span>Thoughtful design — clean, accessible interfaces optimized for action.</span></li>
              <li className="flex gap-2"><Wrench className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400" /><span>Practical integrations — dashboards and data that actually help you run things.</span></li>
            </ul>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-4">

        {/* SERVICE GRID */}
        <ul className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <li
              key={s.slug}
              className="rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-medium">
                  <Link
                    href={`/services/${s.slug}`}
                  >
                    {s.title}
                  </Link>
                </h2>
                <div className="flex items-center gap-2" aria-hidden>
                  {iconSet(s.slug).map((ico, i) => (
                    <span
                      key={i}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-800/60"
                    >
                      {ico}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {s.category ? (
                  <span className="inline-flex items-center rounded-full border border-black/10 dark:border-white/10 bg-neutral-100/70 dark:bg-neutral-800/60 px-2 py-0.5 text-[11px] text-neutral-700 dark:text-neutral-300">
                    {s.category}
                  </span>
                ) : null}
                {s.priceRange ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-600/20 text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-900/20 px-2 py-0.5 text-[11px]">
                    {s.priceRange}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                {s.summary}
              </p>
              {Array.isArray(s.tags) && s.tags?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10 bg-neutral-50/80 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400">
                      #{t}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href={`/services/${s.slug}`}
                  className="text-sm text-indigo-600 dark:text-emerald-400"
                >
                  Learn more
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {/* FIT SECTION */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-5">
            <h2 className="mb-2 text-base font-semibold">Good fit if…</h2>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-emerald-600" /><span>You want a reliable website that loads fast and stays online.</span></li>
              <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-emerald-600" /><span>You prefer clear scopes, practical decisions, and honest tradeoffs.</span></li>
              <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-emerald-600" /><span>You value maintainability over novelty; you want fewer moving parts.</span></li>
            </ul>
          </div>
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-5">
            <h2 className="mb-2 text-base font-semibold">Not a fit if…</h2>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex gap-2"><Shield className="h-4 w-4 mt-0.5 text-neutral-500" /><span>You need bleeding-edge experiments or frequent redesigns just to experiment.</span></li>
              <li className="flex gap-2"><Shield className="h-4 w-4 mt-0.5 text-neutral-500" /><span>You want to micro-manage every technical choice instead of outcomes.</span></li>
              <li className="flex gap-2"><Shield className="h-4 w-4 mt-0.5 text-neutral-500" /><span>You expect results without content, feedback, or timely decisions.</span></li>
            </ul>
          </div>
        </section>

        {/* SIMPLE PROCESS */}
        <section className="mt-10 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-5">
          <h2 className="mb-3 text-base font-semibold">How we work together</h2>
          <ol className="grid sm:grid-cols-5 gap-3 text-sm text-neutral-700 dark:text-neutral-300">
            <li className="rounded-md border border-black/10 dark:border-white/10 p-3"><span className="font-medium">1. Plan</span><br />Goals, scope, and constraints.</li>
            <li className="rounded-md border border-black/10 dark:border-white/10 p-3"><span className="font-medium">2. Design</span><br />Structure, content, and look.</li>
            <li className="rounded-md border border-black/10 dark:border-white/10 p-3"><span className="font-medium">3. Build</span><br />Implement fast, secure features.</li>
            <li className="rounded-md border border-black/10 dark:border-white/10 p-3"><span className="font-medium">4. Launch</span><br />Deploy, monitor, and iterate.</li>
            <li className="rounded-md border border-black/10 dark:border-white/10 p-3"><span className="font-medium">5. Care</span><br />Updates, backups, and support.</li>
          </ol>
        </section>

        {/* FINAL CTA */}
        <section className="mt-10 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-5">
          <div>
            <h2 className="text-base font-semibold">Have a project in mind?</h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">Tell me what you’re trying to achieve — I’ll suggest a lean plan.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={contactHref()} className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 bg-neutral-900 text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm font-medium transition-none">Contact me</Link>
            <Link href="/services/faq" className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 px-3 py-1.5 text-sm">FAQ & Pricing</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
