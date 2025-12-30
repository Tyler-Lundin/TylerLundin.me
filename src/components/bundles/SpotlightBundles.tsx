"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, wrap } from 'framer-motion'
import type { Bundle } from '@/services'
import BundleCard from './BundleCard'
import SpotlightControls from '../shared/SpotlightControls'
import { useRouter } from 'next/navigation'

export type BundleSpotlightItem = Bundle

// Animation variants for the slider
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
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
    scale: 0.9
  })
}

export default function SpotlightBundles({
  bundles,
  className,
  intervalMs = 8000,
}: {
  bundles: BundleSpotlightItem[]
  className?: string
  intervalMs?: number
  initialDelayMs?: number
}) {
  const router = useRouter()
  // We use [page, direction] to track absolute index and swipe direction
  const [[page, direction], setPage] = useState([0, 0])
  const [paused, setPaused] = useState(false)
  
  // Filter valid items
  const items = bundles?.filter(Boolean) ?? []
  const count = items.length

  // Calculate the actual index (modulo wrapper)
  const imageIndex = wrap(0, count, page)
  const currentItem = items[imageIndex]

  // Timer Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }, [page])

  // Auto-play logic
  useEffect(() => {
    if (count <= 1 || paused) return
    
    timerRef.current = setInterval(() => {
      paginate(1)
    }, intervalMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [count, paused, paginate, intervalMs])

  if (!count) return null

  // Gestures for swipe
  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  return (
    <section 
      className={["w-full relative z-10 select-none overflow-hidden", className].filter(Boolean).join(" ")}
      onMouseEnter={() => setPaused(true)} 
      onMouseLeave={() => setPaused(false)} 
      id="bundles"
    >
      <div className="mx-auto max-w-5xl px-4 pb-12">
        {/* Container height: Needs to be tall enough to hold the absolute card.
          Adjust min-h values to match your BundleCard aspect ratio [9/11] 
        */}
        <div className="relative h-[550px] sm:h-[650px] md:h-[750px] w-full max-w-[550px] mx-auto flex items-center justify-center">
          
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
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
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
              className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {/* We force state="current" because only one is visible.
                The motion.div wrapper handles the entrance/exit animations.
              */}
              <div className="relative w-full h-full">
                 <BundleCard
                    item={currentItem}
                    state="current" 
                    onCardClick={() => router.push(`/bundle/${currentItem.slug}`)}
                  />
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

        {/* --- CONTROLS --- */}
        {count > 1 && (
          <div className="relative z-20 mt-6 flex flex-col items-center gap-4">
             {/* Arrow Controls */}
            <SpotlightControls 
              prev={() => paginate(-1)} 
              next={() => paginate(1)} 
              index={imageIndex} 
              total={count} 
            />

            {/* Pagination Dots */}
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const direction = i > imageIndex ? 1 : -1
                    setPage([page + (i - imageIndex), direction])
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 
                    ${i === imageIndex 
                      ? 'w-8 bg-black dark:bg-white' 
                      : 'w-2 bg-black/20 hover:bg-black/40 dark:bg-white/20 dark:hover:bg-white/40'
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
