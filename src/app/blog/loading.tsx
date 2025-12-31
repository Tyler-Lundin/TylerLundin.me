export default function Loading() {
  const cards = Array.from({ length: 12 });
  return (
    <main className="max-w-full overflow-x-hidden mx-2 md:mx-4 my-4 rounded-2xl border border-black/10 dark:border-white/10 text-black dark:text-white">
      <section className="relative p-4 sm:p-6">
        {/* Billboard header skeleton */}
        <div className="mx-auto max-w-7xl px-4">

          {/* Spotlight skeleton */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[2/1] md:aspect-[21/9] max-h-[500px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
          </div>

          {/* Grid skeleton */}
          <div className="mt-10 space-y-8">
            <div>
              <div className="h-6 w-28 rounded bg-black/10 dark:bg-white/10 animate-pulse mb-4" />
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cards.slice(0, 8).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70">
                    <div className="relative aspect-[16/9] bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
                    <div className="p-3">
                      <div className="h-5 w-3/4 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                      <div className="mt-2 h-3 w-full rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                      <div className="mt-1 h-3 w-2/3 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                      <div className="mt-2 flex gap-2">
                        <div className="h-4 w-12 rounded-full bg-black/5 dark:bg-white/10 animate-pulse" />
                        <div className="h-4 w-10 rounded-full bg-black/5 dark:bg-white/10 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="h-6 w-24 rounded bg-black/10 dark:bg-white/10 animate-pulse mb-4" />
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cards.slice(0, 8).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70">
                    <div className="relative aspect-[16/9] bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse" />
                    <div className="p-3">
                      <div className="h-5 w-3/4 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                      <div className="mt-2 h-3 w-full rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                      <div className="mt-1 h-3 w-2/3 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                      <div className="mt-2 flex gap-2">
                        <div className="h-4 w-12 rounded-full bg-black/5 dark:bg-white/10 animate-pulse" />
                        <div className="h-4 w-10 rounded-full bg-black/5 dark:bg-white/10 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

