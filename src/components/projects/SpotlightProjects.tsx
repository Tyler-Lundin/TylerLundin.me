"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Project } from '@/types/projects'
import { projects as defaultProjects } from '@/data/projects'
import ProjectsCard from './ProjectsCard'
import SpotlightProjectsControls from './SpotlightProjectsControls'

type SpotlightProjectsProps = {
  projects?: Project[]
  className?: string
  intervalMs?: number
  initialDelayMs?: number
}

export default function SpotlightProjects({ projects, className, intervalMs = 10500, initialDelayMs = 1800 }: SpotlightProjectsProps) {
  const items = useMemo(() => {
    const source = projects ?? defaultProjects
    return source.filter((p) => p.heroShowcase && p.media?.length).sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
  }, [projects])

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  if (!count) return null

  const prevIdx = (index - 1 + count) % count
  const nextIdx = (index + 1) % count

  return (
    <section className={[ 'w-full relative z-10 select-none', className ].filter(Boolean).join(' ')} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="relative aspect-[3/4] sm:aspect-[16/9] md:aspect-[16/8] mt-4">
          <AnimatePresence initial={false}>
            <ProjectsCard key={`prev-${items[prevIdx]?.id ?? prevIdx}`} project={items[prevIdx]} state="prev" />
            <ProjectsCard key={`current-${items[index]?.id ?? index}`} project={items[index]} state="current" />
            <ProjectsCard key={`next-${items[nextIdx]?.id ?? nextIdx}`} project={items[nextIdx]} state="next" />
          </AnimatePresence>

          {count > 1 && <SpotlightProjectsControls prev={prev} next={next} index={index} total={count} />}

          {count > 1 && (
            <div className=" absolute -bottom-4 translate-y-full  z-50 left-1/2 -translate-x-1/2 flex gap-2">
              {items.map((p, i) => (
                <button key={p.id ?? i} className={`h-1.5 rounded-full ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} onClick={() => setIndex(i)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
