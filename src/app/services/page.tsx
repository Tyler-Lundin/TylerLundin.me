import Link from 'next/link'
import {
  CloudflareIcon,
  PhotoshopIcon,
  SupabaseIcon,
  VercelIcon
} from '@/components/icons/BrandIcons'
import { LayoutDashboard, Shield, Database, PenTool } from 'lucide-react'
import type { Metadata } from 'next'
import { services } from '@/data/services'
import StickerTyler from '@/components/StickerTyler'

export const metadata: Metadata = {
  title: 'Services | Tyler Lundin',
  description:
    'Web services offered: hosting, web design, logo design, custom dashboards and data, and authentication systems.'
}

export default function ServicesIndexPage() {
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

  return (
    <main className="min-h-screen max-w-screen py-32 bg-gradient-to-b from-neutral-50 dark:from-black via-transparent to-neutral-100 dark:to-neutral-950">
      <div className="container mx-auto px-6 max-w-5xl py-4">
        <div className="mb-6 h-[2px] w-20 bg-gradient-to-r from-neutral-300/70 via-neutral-400/40 to-transparent dark:from-neutral-600/70 dark:via-neutral-600/40" />

        {/* HERO CARD */}
        <section
          className="
            relative mb-10 overflow-hidden
            rounded-xl border border-black/10 dark:border-white/10
            bg-white/70 dark:bg-neutral-900/70 backdrop-blur
            p-6 sm:p-8 md:pr-40
          "
        >
          {/* Sticker – lives behind content, tucked into corner */}
          <div
            className="
              pointer-events-none select-none
              absolute -right-4 -bottom-16
              opacity-40 sm:opacity-60 md:opacity-80
            "
            aria-hidden
          >
            <StickerTyler sticker="prepared" size={6} className="scale-x-[-1]" />
          </div>

          {/* Copy */}
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="inline-block rounded border border-black/10 dark:border-white/10 bg-neutral-100/70 px-2 py-0.5 text-[11px] uppercase tracking-wide text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-400">
              Services
            </span>

            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">
              Services
            </h1>

            <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300">
              Hosting, design, logos, dashboards, auth — everything wired
              together so your site actually runs fast, looks sharp, and stays
              online.
            </p>

            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Pick a single service or bundle a few. I handle the messy wiring
              so you can focus on running the business.
            </p>
          </div>
        </section>

        {/* SERVICE GRID */}
        <ul className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <li
              key={s.slug}
              className="rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-4 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-medium">
                  <Link
                    href={`/services/${s.slug}`}
                    className="hover:underline"
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
              <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                {s.summary}
              </p>
              <div className="mt-3">
                <Link
                  href={`/services/${s.slug}`}
                  className="text-sm text-indigo-600 hover:underline dark:text-emerald-400"
                >
                  Learn more
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

