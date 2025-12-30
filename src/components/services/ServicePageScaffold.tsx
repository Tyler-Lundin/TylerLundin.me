import Link from 'next/link'
import { ServiceSublinks } from '@/components/services/ServiceSublinks'

export function ServicePageScaffold({
  title,
  description,
  features,
  currentSlug,
}: {
  title: string
  description: string
  features: string[]
  currentSlug: string
}) {
  return (
    <main className="min-h-screen max-w-screen py-28 text-black dark:text-white">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="mb-6 h-[2px] w-20 bg-gradient-to-r from-neutral-300/70 via-neutral-400/40 to-transparent dark:from-neutral-600/70 dark:via-neutral-600/40" />

        <section className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur p-6 sm:p-8">
          <div className="mb-4">
            <span className="inline-block text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/60 border border-black/10 dark:border-white/10 px-2 py-0.5 rounded">
              Service
            </span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
          <p className="text-neutral-700 dark:text-neutral-300 mt-3">{description}</p>
          <p className="text-neutral-700 dark:text-neutral-300 mt-2 text-sm">
            Based in <strong>Spokane, WA</strong>. Looking for a local partner? See
            {' '}<a href="/spokane-web-developer" className="underline">Spokane web developer</a>.
          </p>

          {features?.length ? (
            <div className="mt-8">
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">What’s included</p>
              <ul className="grid sm:grid-cols-2 gap-2">
                {features.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-3"
                  >
                    <CheckIcon className="mt-0.5 h-4 w-4 text-indigo-600 dark:text-emerald-400" />
                    <span className="text-sm text-neutral-900 dark:text-neutral-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8 rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">Have a project in mind?</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Let’s scope it together and get a quote.</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-neutral-100/70 dark:bg-neutral-800/70 text-sm text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Get a quote
            </Link>
          </div>
        </section>

        <ServiceSublinks currentSlug={currentSlug} />
      </div>
    </main>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
