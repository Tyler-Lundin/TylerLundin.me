"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, wrap } from 'framer-motion'
import { useRouter } from 'next/navigation'
import SpotlightControls from '../shared/SpotlightControls'

export type BlogSpotlightItem = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  cover_image_url?: string | null
  published_at?: string | null
}

// Animation variants for sliding effect
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95,
    zIndex: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95
  })
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
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
  const router = useRouter()
  
  // Data Prep
  const items = useMemo(() => posts?.filter(Boolean) ?? [], [posts])
  const count = items.length

  // State: [page, direction]
  const [[page, direction], setPage] = useState([0, 0])
  const [paused, setPaused] = useState(false)

  // Calculate current index wrapping around
  const imageIndex = wrap(0, count, page)
  const currentItem = items[imageIndex]

  // Timer Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startRef = useRef<NodeJS.Timeout | null>(null)

  // Navigation Logic
  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }, [page])

  // Autoplay
  useEffect(() => {
    if (count <= 1 || paused) return

    if (startRef.current) clearTimeout(startRef.current)
    if (timerRef.current) clearInterval(timerRef.current)

    startRef.current = setTimeout(() => {
      timerRef.current = setInterval(() => {
        paginate(1)
      }, intervalMs)
    }, Math.max(0, initialDelayMs))

    return () => {
      if (startRef.current) clearTimeout(startRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [count, paused, paginate, intervalMs, initialDelayMs])

  // Keyboard Navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') paginate(1)
      if (e.key === 'ArrowLeft') paginate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paginate])

  if (!count) return null

  return (
    <section 
      className={["w-full relative z-10 select-none overflow-hidden", className].filter(Boolean).join(" ")}
      onMouseEnter={() => setPaused(true)} 
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-5xl px-4 pb-12">
        {/* Aspect Ratio Container */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[2/1] md:aspect-[21/9] max-h-[500px] flex items-center justify-center">
          
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x)
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1)
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1)
                }
              }}
              className="absolute inset-0 w-full h-full cursor-pointer rounded-2xl overflow-hidden shadow-xl"
              onClick={() => router.push(`/blog/${currentItem.slug}`)}
            >
              {/* Image Layer */}
              {currentItem.cover_image_url ? (
                // Use natural-height image with vertical pan; container clips overflow
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentItem.cover_image_url}
                  alt={currentItem.title}
                  className="absolute left-0 top-0 w-full h-auto pan-vert object-top"
                  style={{ ['--pan-amount' as any]: '-28%' }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-pink-500/40 dark:from-indigo-900/40 dark:to-pink-900/40" />
              )}

              {/* Scrim/Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

              {/* Text Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10 text-white pointer-events-none">
                <div className="max-w-3xl">
                  <h3 className="text-xl sm:text-2xl md:text-4xl font-bold drop-shadow-md leading-tight mb-2">
                    {currentItem.title}
                  </h3>
                  {currentItem.excerpt && (
                    <p className="text-sm sm:text-base md:text-lg text-white/90 line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {currentItem.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

        {/* --- CONTROLS --- */}
        {count > 1 && (
          <div className="relative z-20 mt-4 flex flex-col items-center gap-4">
             {/* Arrow Controls */}
            <SpotlightControls 
              prev={() => paginate(-1)} 
              next={() => paginate(1)} 
              index={imageIndex} 
              total={count} 
            />

            {/* Pagination Dots */}
            <div className="flex gap-2">
              {items.map((p, i) => (
                <button
                  key={p.id ?? i}
                  onClick={() => {
                    const direction = i > imageIndex ? 1 : -1
                    setPage([page + (i - imageIndex), direction])
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 
                    ${i === imageIndex 
                      ? 'w-8 bg-black dark:bg-white' 
                      : 'w-2 bg-black/20 hover:bg-black/40 dark:bg-white/20 dark:hover:bg-white/40'
                    }`}
                  aria-label={`Go to post ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
