import type { Metadata } from 'next'
import Link from 'next/link'
import waCities from '@/config/locations/wa'

export const metadata: Metadata = {
  title: 'Locations | Washington Cities | Tyler Lundin',
  description: 'Browse all Washington State cities and towns served. SEO index of locations in WA.'
}

export default function LocationsPage() {
  const cities = waCities;

  return (
    <main className="min-h-screen max-w-screen py-28 text-black dark:text-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-6 h-[2px] w-20 bg-gradient-to-r from-neutral-300/70 via-neutral-400/40 to-transparent dark:from-neutral-600/70 dark:via-neutral-600/40" />

        <section className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur p-6 sm:p-8">
          <div className="mb-2">
            <span className="inline-block text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/60 border border-black/10 dark:border-white/10 px-2 py-0.5 rounded">
              Locations
            </span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight">Washington State Cities I Serve</h1>
          <p className="text-neutral-700 dark:text-neutral-300 mt-3 text-sm">
            A complete index of incorporated cities and towns across Washington. If your city isn’t listed, I likely still serve it—reach out and I’ll confirm.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-medium">All Washington Cities & Towns</h2>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">{cities.length} total</span>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link href={`/locations/${c.slug}`} className="group flex items-center gap-3 rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 text-sm hover:bg-white/90 dark:hover:bg-neutral-900/80 transition-colors">
                  <CityAvatar name={c.name} icon={c.icon} />
                  <span className="group-hover:underline">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: 'Washington State Locations',
              description: 'Index of cities and towns in Washington State',
              hasPart: cities.map((c) => ({ '@type': 'Place', name: c.name }))
            })
          }}
        />
      </div>
    </main>
  )
}

function CityAvatar({ name, icon }: { name: string; icon?: string }) {
  const initials = name.slice(0, 2).toUpperCase()
  if (icon) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={icon} alt={name} className="h-6 w-6 rounded-sm object-cover border border-black/10 dark:border-white/10" />
    )
  }
  return (
    <span className="inline-flex items-center justify-center h-6 w-6 rounded-sm border border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
      {initials}
    </span>
  )
}
