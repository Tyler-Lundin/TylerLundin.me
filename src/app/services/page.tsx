import Link from 'next/link'
import { CloudflareIcon, PhotoshopIcon, SupabaseIcon, VercelIcon } from '@/components/icons/BrandIcons'
import { LayoutDashboard, Shield, Database, PenTool } from 'lucide-react'
import type { Metadata } from 'next'
import { services } from '@/data/services'

export const metadata: Metadata = {
  title: 'Services | Tyler Lundin',
  description: 'Web services offered: hosting, web design, logo design, custom dashboards and data, and authentication systems.'
}

export default function ServicesIndexPage() {
  const iconSet = (slug: string) => {
    switch (slug) {
      case 'web-hosting':
        return [<VercelIcon key="vercel" className="text-black dark:text-white" />, <CloudflareIcon key="cf" />]
      case 'web-design':
        return [<PhotoshopIcon key="ps" />, <PenTool key="pen" className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />]
      case 'logo-design':
        return [<PhotoshopIcon key="ps" />, <PenTool key="pen" className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />]
      case 'dashboards-data':
        return [<LayoutDashboard key="dash" className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />, <Database key="db" className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />, <SupabaseIcon key="sb" />]
      case 'authentication':
        return [<Shield key="auth" className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />, <SupabaseIcon key="sb" />]
      default:
        return []
    }
  }

  return (
    <main className="min-h-screen py-32 bg-gradient-to-b from-neutral-50 dark:from-black via-transparent to-neutral-100 dark:to-neutral-950">
      <div className="container mx-auto px-6 max-w-5xl py-4">
        <div className="mb-6 h-[2px] w-20 bg-gradient-to-r from-neutral-300/70 via-neutral-400/40 to-transparent dark:from-neutral-600/70 dark:via-neutral-600/40" />
        <section className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur p-6 sm:p-8 mb-10">
          <div className="mb-3">
            <span className="inline-block text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/60 border border-black/10 dark:border-white/10 px-2 py-0.5 rounded">Services</span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight">Services</h1>
          <p className="text-neutral-700 dark:text-neutral-300 mt-2 max-w-2xl">
            Everything you need to launch and grow online. Choose a single service or bundle them together—built as one cohesive package.
          </p>
        </section>

        <ul className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <li key={s.slug} className="border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white/70 dark:bg-neutral-900/60 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-medium">
                <Link href={`/services/${s.slug}`} className="hover:underline">
                  {s.title}
                </Link>
                </h2>
                <div className="flex items-center gap-2" aria-hidden>
                  {iconSet(s.slug).map((ico, i) => (
                    <span key={i} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-800/60">
                      {ico}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2">{s.summary}</p>
              <div className="mt-3">
                <Link href={`/services/${s.slug}`} className="text-indigo-600 dark:text-emerald-400 text-sm hover:underline">
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
