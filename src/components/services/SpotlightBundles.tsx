"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Bundle } from '@/services'

export type BundleSpotlightItem = Bundle

export default function SpotlightBundles({
  bundles,
  className,
  intervalMs = 9000,
  initialDelayMs = 1200,
}: {
  bundles: BundleSpotlightItem[]
  className?: string
  intervalMs?: number
  initialDelayMs?: number
}) {
  const items = useMemo(() => bundles?.filter(Boolean) ?? [], [bundles])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = items.length
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startRef = useRef<NodeJS.Timeout | null>(null)

  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(count, 1)), [count])
  const prev = useCallback(() => setIndex((i) => (i - 1 + Math.max(count, 1)) % Math.max(count, 1)), [count])

  useEffect(() => {
    if (count <= 1 || paused) return
    if (startRef.current) clearTimeout(startRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    startRef.current = setTimeout(() => {
      timerRef.current = setInterval(next, intervalMs)
    }, Math.max(0, initialDelayMs))
    return () => {
      if (startRef.current) clearTimeout(startRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [count, paused, next, intervalMs, initialDelayMs])

  if (!count) return null

  const current = items[index]
  const prevIdx = (index - 1 + count) % count
  const nextIdx = (index + 1) % count

  const themeFor = (slug: string) => {
    switch (slug) {
      case 'launch':
        return {
          bg: 'bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-950 dark:to-teal-900',
          accentText: 'text-emerald-900 dark:text-emerald-200',
          badge: 'border-emerald-600/30 bg-emerald-50/90 dark:bg-emerald-900/25',
          bestFor: 'New sites, fast launch, marketing pages',
          ribbon: 'Popular'
        }
      case 'operate':
        return {
          bg: 'bg-gradient-to-br from-indigo-100 to-violet-200 dark:from-indigo-950 dark:to-violet-900',
          accentText: 'text-indigo-900 dark:text-indigo-200',
          badge: 'border-indigo-600/30 bg-indigo-50/90 dark:bg-indigo-900/25',
          bestFor: 'Internal tools, portals, role-based areas',
          ribbon: 'Pro'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-950 dark:to-neutral-900',
          accentText: 'text-neutral-900 dark:text-neutral-200',
          badge: 'border-neutral-500/30 bg-white/80 dark:bg-neutral-800/30',
          bestFor: 'Modern web foundations',
          ribbon: ''
        }
    }
  }

  const Card = ({ item, state }: { item: BundleSpotlightItem; state: 'prev' | 'current' | 'next' }) => {
    const baseCls = 'group absolute top-1/2 -translate-y-1/2 rounded-xl overflow-hidden border border-black/10 dark:border-white/10'
    const layout: Record<typeof state, string> = {
      prev: 'left-[2%] w-[40%] sm:left-[4%] sm:w-[42%] md:left-[2%] md:w-[38%] lg:left-[2%] lg:w-[36%]',
      current: 'left-1/2 -translate-x-1/2 w-[86%] sm:w-[78%] md:w-[74%] lg:w-[70%] xl:w-[64%] 2xl:w-[60%]',
      next: 'right-[2%] w-[40%] sm:right-[4%] sm:w-[42%] md:right-[2%] md:w-[38%] lg:right-[2%] lg:w-[36%]',
    }
    const isCurrent = state === 'current'
    const scale = isCurrent ? 1 : 0.94
    const opacity = isCurrent ? 1 : 0.55

    const open = () => (window.location.href = `/services#bundles`)

    const theme = themeFor(item.slug)
    return (
      <motion.div
        key={`${item.slug}-${state}`}
        className={`${baseCls} ${layout[state]} h-full shadow cursor-pointer ${theme.bg}`}
        style={{ zIndex: state === 'current' ? 3 : state === 'prev' ? 2 : 1 }}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity, scale }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={open}
        role="link"
        tabIndex={0}
      >
        <div
          className={[
            'absolute inset-0 grid text-black dark:text-white',
            isCurrent
              ? 'grid-rows-[auto_auto_1fr_auto] gap-3 p-5 sm:p-7'
              : 'grid-rows-[auto_auto_1fr_auto] gap-2 p-3 sm:p-4'
          ].join(' ')}
        >
          {/* Header row: badge + price */}
          <div className="min-w-0 flex items-start justify-between gap-3">
            <span className={[
              'inline-flex rounded border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300',
              isCurrent ? 'px-2 py-0.5 text-[11px]' : 'px-1.5 py-0.5 text-[10px]'
            ].join(' ')}>
              {item.title.split(' ')[0]} bundle
            </span>
            {item.priceRange && (
              <span
                className={[
                  'inline-flex items-center rounded-md font-semibold',
                  theme.badge,
                  isCurrent ? 'px-2.5 py-1 text-xs sm:text-sm md:text-base' : 'px-2 py-0.5 text-[10px] sm:text-xs md:text-sm'
                ].join(' ')}
              >
                {item.priceRange}
              </span>
            )}
          </div>

          {/* Title + summary + tags */}
          <div className="min-w-0">
            <h3
              className={[
                'font-extrabold tracking-tight',
                isCurrent
                  ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight'
                  : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug'
              ].join(' ')}
            >
              {item.title}
            </h3>
            <div className={[theme.accentText, isCurrent ? 'text-xs sm:text-sm md:text-base' : 'text-[11px] sm:text-xs'].join(' ')}>
              Best for: {theme.bestFor}
            </div>
            {item.summary && (
              <p
                className={[
                  'mt-1 text-neutral-700 dark:text-neutral-300 max-w-2xl',
                  isCurrent ? 'text-sm sm:text-base md:text-lg' : 'text-xs sm:text-sm'
                ].join(' ')}
              >
                {item.summary}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {item.tags?.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className={[
                    'uppercase tracking-wide rounded border border-black/10 dark:border-white/10 bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300',
                    isCurrent ? 'text-[10px] sm:text-[11px] md:text-xs px-1.5 py-0.5' : 'text-[9px] sm:text-[10px] px-1 py-0.5'
                  ].join(' ')}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Feature grid fills the middle */}
          <div className="min-w-0">
            {item.features?.length ? (
              <ul
                className={[
                  'mt-1 grid gap-2',
                  isCurrent ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                ].join(' ')}
              >
                {item.features.slice(0, 6).map((f) => (
                  <li
                    key={f}
                    className={[
                      'rounded-md border border-black/10 dark:border-white/10 bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200',
                      isCurrent ? 'px-3 py-2 text-sm' : 'px-2.5 py-1.5 text-[13px]'
                    ].join(' ')}
                  >
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Curated pairing of services designed to work together.</div>
            )}
          </div>

          {/* Footer row: includes + CTA */}
          <div className="flex items-end justify-between gap-2">
            {item.serviceSlugs?.length ? (
              <div className="min-w-0">
                <div className={isCurrent ? 'text-[11px] sm:text-xs md:text-sm text-neutral-600 dark:text-neutral-400' : 'text-[10px] sm:text-[11px] text-neutral-600 dark:text-neutral-400'}>
                  Includes:
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {item.serviceSlugs.map((s) => (
                    <span key={s} className={isCurrent ? 'text-[11px] sm:text-xs rounded border border-black/10 dark:border-white/10 px-1.5 py-0.5 bg-white/70 dark:bg-neutral-800/60' : 'text-[10px] rounded border border-black/10 dark:border-white/10 px-1 py-0.5 bg-white/60 dark:bg-neutral-800/50'}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <span />
            )}
            <Link
              href={`/contact?bundle=${encodeURIComponent(item.slug)}`}
              className={[
                'inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 bg-neutral-900 text-white dark:bg-white dark:text-black font-medium hover:opacity-90 transition',
                isCurrent ? 'px-3.5 py-2 text-sm md:text-base' : 'px-2.5 py-1.5 text-xs'
              ].join(' ')}
            >
              Ask about this bundle
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <section className={["w-full relative z-10 select-none ", 
      className].filter(Boolean).join(" ")}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} id="bundles">
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="relative aspect-[16/9] sm:aspect-[16/8] md:aspect-[16/7] mt-4">
          <AnimatePresence initial={false}>
            <Card key={`prev-${items[prevIdx]?.slug ?? prevIdx}`} item={items[prevIdx]} state="prev" />
            <Card key={`current-${current?.slug ?? index}`} item={current} state="current" />
            <Card key={`next-${items[nextIdx]?.slug ?? nextIdx}`} item={items[nextIdx]} state="next" />
          </AnimatePresence>

          {/* Controls (match home hero showcase) */}
          {count > 1 && <Controls {...{ prev, next }} />}

          {count > 1 && (
            <div className=" absolute -bottom-4 translate-y-full  z-50 left-1/2 -translate-x-1/2 flex gap-2">
              {items.map((p, i) => (
                <button key={p.slug ?? i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} onClick={() => setIndex(i)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Controls copied to match home hero showcase
function Controls({ prev, next }: { prev: () => void; next: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 h-full   z-40">
      <div className="absolute inset-x-2 bottom-2 flex items-end justify-between sm:inset-x-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:px-2">
        <NavButton dir="left" label="Previous" onClick={prev} />
        <NavButton dir="right" label="Next" onClick={next} />
      </div>
    </div>
  )
}

function NavButton({
  dir,
  label,
  onClick,
}: {
  dir: 'left' | 'right'
  label: string
  onClick: () => void
}) {
  const isLeft = dir === 'left'
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        'pointer-events-auto select-none',
        'h-12 w-14 sm:h-12 sm:w-12',
        isLeft ? 'rounded-2xl rounded-l-3xl' : 'rounded-2xl rounded-r-3xl',
        'opacity-100 sm:opacity-80 hover:sm:opacity-100',
        'bg-black/15 hover:bg-black/20 dark:bg-white/15 dark:hover:bg-white/20',
        'border border-black/20 dark:border-white/20',
        'shadow-[0_10px_30px_rgba(0,0,0,0.25)]',
        'transition duration-200 active:scale-[0.96]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30',
        isLeft ? 'sm:-translate-x-1' : 'sm:translate-x-1',
        'grid place-items-center',
      ].join(' ')}
    >
      <Chevron dir={dir} />
    </button>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  const isLeft = dir === 'left'
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="dark:text-white/90 text-black/90"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isLeft ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  )
}
