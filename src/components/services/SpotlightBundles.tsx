"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Bundle } from '@/services'
import Image from 'next/image'
import BundleCard from './BundleCard'
import SpotlightBundlesControls from './SpotlightBundlesControls'

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


  return (
    <section className={["w-full relative z-10 select-none ",
      className].filter(Boolean).join(" ")}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} id="bundles">
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <div className="relative aspect-[3/4] max-h-[700px] mx-auto sm:aspect-[4/3] md:aspect-[16/8] mt-4">
          <AnimatePresence initial={false}>
            <BundleCard key={`prev-${items[prevIdx]?.slug ?? prevIdx}`} item={items[prevIdx]} state="prev" />
            <BundleCard key={`current-${current?.slug ?? index}`} item={current} state="current" />
            <BundleCard key={`next-${items[nextIdx]?.slug ?? nextIdx}`} item={items[nextIdx]} state="next" />
          </AnimatePresence>

          {/* Controls (match home hero showcase) */}
          {count > 1 && <SpotlightBundlesControls {...{ prev, next }} />}

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
