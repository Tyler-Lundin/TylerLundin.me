import Link from 'next/link'
import { services } from '@/data/services'

export function ServiceSublinks({ currentSlug, title = 'Explore other services' }: { currentSlug?: string; title?: string }) {
  const others = services.filter((s) => s.slug !== currentSlug)

  if (!others.length) return null

  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {others.map((s) => (
          <Link
            key={s.slug}
            href={`/services/${s.slug}`}
            className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur text-sm text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition-colors"
          >
            {s.title}
          </Link>
        ))}
      </div>
    </section>
  )
}

