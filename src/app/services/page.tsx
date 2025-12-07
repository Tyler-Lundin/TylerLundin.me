import Link from 'next/link'
import type { Metadata } from 'next'
import { services } from '@/data/services'

export const metadata: Metadata = {
  title: 'Services | Tyler Lundin',
  description: 'Web services offered: hosting, web design, logo design, custom dashboards and data, and authentication systems.'
}

export default function ServicesIndexPage() {
  return (
    <main className="min-h-screen py-32 text-black dark:text-white">
      <div className="container mx-auto px-6 max-w-5xl py-4">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold">Services</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl">
            Everything you need to launch and grow online. Choose a single service or bundle them together—built as one cohesive package.
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <li key={s.slug} className="border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white/70 dark:bg-neutral-900/60 backdrop-blur">
              <h2 className="text-xl font-medium">
                <Link href={`/services/${s.slug}`} className="hover:underline">
                  {s.title}
                </Link>
              </h2>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">{s.summary}</p>
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

