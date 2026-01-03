"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, wrap } from 'framer-motion'
import type { Project } from '@/types/projects'
import { projects as defaultProjects } from '@/data/projects'
import ProjectsCard from './ProjectsCard'
import SpotlightControls from '../shared/SpotlightControls'

type SpotlightProjectsProps = {
  projects?: Project[]
  className?: string
  intervalMs?: number
  initialDelayMs?: number
}

// Animation variants for the slider direction
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

// Swipe sensitivity
const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

export default function SpotlightProjects({ 
  projects, 
  className, 
  intervalMs = 10500, 
  initialDelayMs = 1800 
}: SpotlightProjectsProps) {
  
  // 1. Data Prep: Filter and Sort
  const items = useMemo(() => {
    const source = projects ?? defaultProjects
    return source
      .filter((p) => p.heroShowcase && p.media?.length)
      .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
  }, [projects])

  const count = items.length

  // 2. State: Track [page, direction] for absolute pagination
  const [[page, direction], setPage] = useState([0, 0])
  const [paused, setPaused] = useState(false)
  
  // Calculate current index (modulo wrapper handles negative/overflow)
  const imageIndex = wrap(0, count, page)
  const currentProject = items[imageIndex]

  // Refs for timers
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startRef = useRef<NodeJS.Timeout | null>(null)

  // 3. Navigation Helpers
  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }, [page])

  // 4. Autoplay Logic
  useEffect(() => {
    if (count <= 1 || paused) return

    // Clear existing
    if (startRef.current) clearTimeout(startRef.current)
    if (timerRef.current) clearInterval(timerRef.current)

    // Start with delay, then interval
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

  // 5. Keyboard Navigation
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
      className={['w-full relative z-10 select-none overflow-hidden', className].filter(Boolean).join(' ')} 
      onMouseEnter={() => setPaused(true)} 
      onMouseLeave={() => setPaused(false)}
      id="projects"
    >
      <div className="mx-auto max-w-5xl sm:px-4 pb-12">
        {/* Container for the Card - Height must accommodate the card aspect ratio */}
        <div className="relative h-[550px] sm:h-[650px] md:h-[750px] w-full max-w-[600px] mx-auto flex items-center justify-center">
          
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
              {/* We pass state="current" because this is the ONLY card visible. 
                  The motion wrapper handles the entrance/exit animations.
              */}
              <div className="relative w-full h-full">
                <ProjectsCard
                  project={currentProject}
                  state="current"
                />
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

        {/* --- CONTROLS --- */}
        {count > 1 && (
          <div className="relative z-20 mt-2 flex flex-col items-center gap-4">
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
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === imageIndex 
                      ? 'w-8 bg-black dark:bg-white' 
                      : 'w-2 bg-black/20 hover:bg-black/40 dark:bg-white/20 dark:hover:bg-white/40'
                  }`} 
                  onClick={() => {
                    const direction = i > imageIndex ? 1 : -1
                    setPage([page + (i - imageIndex), direction])
                  }}
                  aria-label={`Go to project ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
