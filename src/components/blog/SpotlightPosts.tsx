"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export type BlogSpotlightItem = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  cover_image_url?: string | null
  published_at?: string | null
}

export default function SpotlightPosts({
  posts,
  className,
  intervalMs = 9000,
  initialDelayMs = 1200,
}: {
  posts: BlogSpotlightItem[]
  className?: string
  intervalMs?: number
  initialDelayMs?: number
}) {
  const items = useMemo(() => posts?.filter(Boolean) ?? [], [posts])
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

  const Card = ({ item, state }: { item: BlogSpotlightItem; state: 'prev' | 'current' | 'next' }) => {
    const baseCls = 'group absolute top-1/2 -translate-y-1/2 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur'
    const layout: Record<typeof state, string> = {
      prev: 'left-[2%] w-[40%] sm:left-[4%] sm:w-[42%] md:left-[2%] md:w-[38%] lg:left-[2%] lg:w-[36%]',
      current: 'left-1/2 -translate-x-1/2 w-[86%] sm:w-[78%] md:w-[74%] lg:w-[70%] xl:w-[64%] 2xl:w-[60%]',
      next: 'right-[2%] w-[40%] sm:right-[4%] sm:w-[42%] md:right-[2%] md:w-[38%] lg:right-[2%] lg:w-[36%]',
    }
    const scale = state === 'current' ? 1 : 0.94
    const opacity = state === 'current' ? 1 : 0.55

    const open = () => (window.location.href = `/blog/${item.slug}`)

    return (
      <motion.div
        key={`${item.id}-${state}`}
        className={`${baseCls} ${layout[state]} aspect-[16/10] shadow-lg cursor-pointer`}
        style={{ zIndex: state === 'current' ? 3 : state === 'prev' ? 2 : 1 }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity, scale }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        onClick={open}
        role="link"
        tabIndex={0}
      >
        <div className="absolute inset-0">
          {item.cover_image_url ? (
            <Image src={item.cover_image_url} alt={item.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-pink-500/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold truncate drop-shadow">{item.title}</h3>
            {item.excerpt && <p className="mt-0.5 text-xs sm:text-sm text-white/85 line-clamp-2">{item.excerpt}</p>}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <section className={["w-full relative z-10 select-none", className].filter(Boolean).join(" ")}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative aspect-[16/9] mt-4">
          <AnimatePresence initial={false}>
            <Card key={`prev-${items[prevIdx]?.id ?? prevIdx}`} item={items[prevIdx]} state="prev" />
            <Card key={`current-${current?.id ?? index}`} item={current} state="current" />
            <Card key={`next-${items[nextIdx]?.id ?? nextIdx}`} item={items[nextIdx]} state="next" />
          </AnimatePresence>

          {count > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {items.map((p, i) => (
                <button key={p.id ?? i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} onClick={() => setIndex(i)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
