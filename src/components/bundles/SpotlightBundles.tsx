"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Bundle } from '@/services'
import BundleCard from './BundleCard'
import SpotlightControls from '../shared/SpotlightControls'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

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


  return (
    <section className={["w-full relative z-10 select-none ",
      className].filter(Boolean).join(" ")}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} id="bundles">
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <div className="relative min-h-[500px] sm:min-h-[575px] md:min-h-[650px]  mt-4 max-w-lg mx-auto">
          <AnimatePresence initial={false}>
            <BundleCard
              key={`prev-${items[prevIdx]?.slug ?? prevIdx}`}
              item={items[prevIdx]}
              state="prev"
              onCardClick={(_, state) => {
                if (state === 'prev') setIndex(prevIdx)
              }}
            />
            <BundleCard
              key={`current-${current?.slug ?? index}`}
              item={current}
              state="current"
              onCardClick={(item, state) => {
                if (!item) return
                if (state === 'current') router.push(`/bundle/${item.slug}`)
              }}
            />
            <BundleCard
              key={`next-${items[nextIdx]?.slug ?? nextIdx}`}
              item={items[nextIdx]}
              state="next"
              onCardClick={(_, state) => {
                if (state === 'next') setIndex(nextIdx)
              }}
            />
          </AnimatePresence>

          {/* Controls (match home hero showcase) */}
          {count > 1 && <SpotlightControls prev={prev} next={next} index={index} total={count} />}

          {count > 1 && (
            <div className=" absolute -bottom-4 translate-y-full  z-50 left-1/2 -translate-x-1/2 flex gap-2">
              {items.map((p, i) => (
                <button key={p.slug ?? i} className={`h-1.5 rounded-full transition-all duration-750 ${i === index ? 'w-6 bg-black dark:bg-white' : 'w-2 bg-black/50 dark:bg-white/60'}`} onClick={() => setIndex(i)} />
              ))}
            </div>
          )}
          {/* external hero timer controls which showcase is visible */}
        </div>
      </div>
    </section>
  )
}
