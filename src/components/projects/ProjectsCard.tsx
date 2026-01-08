"use client";

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import type { Project, ProjectMedia } from '@/types/projects'
import { usePrefersDark } from '@/hooks/usePrefersDark'

// Helper to pick all relevant media based on dark/light mode
function getThemeMedia(media: ProjectMedia[], isDark: boolean): ProjectMedia[] {
  if (!media?.length) return []
  const pref: 'dark' | 'light' = isDark ? 'dark' : 'light'

  // 1. Get media matching theme
  const matching = media.filter((m) => (m.variant ? m.variant === pref : true))

  // 2. If no matching (e.g. only dark variants and we are in light mode), fallback to all
  if (matching.length === 0) return media

  return matching
}

export default function ProjectsCard({
  project,
  state,
  onClick
}: {
  project: Project;
  state: 'prev' | 'current' | 'next';
  onClick?: () => void
}) {
  const isDark = usePrefersDark()
  const themeMedia = useMemo(() => getThemeMedia(project.media, isDark), [project.media, isDark])
  const images = useMemo(() => themeMedia.filter(m => m.type === 'image'), [themeMedia])
  const [isLoaded, setIsLoaded] = useState(false)

  // Determine status (Live vs Demo)
  const status: 'live' | 'demo' = project.status ?? (project.links?.some((l) => l.type === 'live') ? 'live' : 'demo')

  // Layout & Animation Constants
  const layout: Record<typeof state, string> = {
    prev: 'left-0 -translate-x-1/2 scale-90 -rotate-3 z-10 brightness-[0.6] blur-[1px]',
    current: 'left-1/2 -translate-x-1/2 z-30 brightness-100 blur-0',
    next: 'right-0 translate-x-1/2 scale-90 rotate-3 z-20 brightness-[0.6] blur-[1px]',
  }

  const isCurrent = state === 'current'
  const scale = isCurrent ? 1 : 0.94
  const blur = isCurrent ? 'none' : 'blur-[1px] opacity-50'

  // Infinite Scroll Logic - allow looping with even 1 image
  const canLoop = images.length >= 1
  const duplicatedImages = [...images, ...images]
  const loopControls = useAnimation()

  useEffect(() => {
    if (isCurrent && canLoop) {
      loopControls.start({
        y: ['0%', '-50%'],
        transition: {
          duration: images.length * 12, // 12s per image roughly
          ease: 'linear',
          repeat: Infinity,
        }
      })
    } else {
      loopControls.stop()
      loopControls.set({ y: '0%' })
    }
  }, [isCurrent, canLoop, images.length, loopControls])

  const handleInteraction = (type: 'enter' | 'leave') => {
    if (!canLoop) return
    // Simple linear loop remains the same
  }

  return (
    <motion.div
      className={[
        'group absolute top-1/2 -translate-y-1/2 rounded-2xl overflow-hidden',
        'border border-white/10 shadow-2xl cursor-pointer select-none',
        'aspect-[9/11] h-full max-w-[90vw]',
        layout[state],
      ].join(' ')}
      initial={false}
      animate={{ opacity: isCurrent ? 1 : 0.6, scale }}
      transition={{ type: 'spring', stiffness: 420, damping: 42, mass: 0.6 }}
      onClick={() => { if (onClick) { onClick() } else { window.location.href = `/project/${project.slug}` } }}
      role="link"
      tabIndex={0}
      onMouseEnter={() => handleInteraction('enter')}
      onMouseLeave={() => handleInteraction('leave')}
    >
      {/* --- MEDIA LAYER --- */}
      <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900">

        {images.length > 0 ? (
          <div className="h-full w-full overflow-hidden relative">
            <motion.div
              className="flex flex-col w-full"
              animate={loopControls}
            >
              {duplicatedImages.map((media, idx) => (
                <div key={`${media.id}-${idx}`} className="relative w-full shrink-0 bg-white dark:bg-black">
                  <img
                    src={media.src}
                    alt={media.alt ?? project.title}
                    className="w-full h-auto object-top mb-6"
                    onLoad={() => setIsLoaded(true)}
                  />

                  <div className="absolute inset-x-0 bottom-5 h-12 bg-gradient-to-t from-white via-white dark:from-black dark:via-black to-transparent z-10 pointer-events-none" />
                </div>
              ))}
            </motion.div>

            {/* Fixed Blending Gradients at top and bottom of the card viewport */}
          </div>
        ) : themeMedia[0]?.type === 'video' ? (
          <video
            className={`h-full w-full object-cover ${blur} ${state !== 'current' && !isLoaded ? 'blur-md' : ''}`}
            autoPlay={state === 'current'}
            loop
            muted
            playsInline
            onLoadedData={() => setIsLoaded(true)}
          >
            <source src={themeMedia[0].src} />
          </video>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400">No Media</div>
        )}

        {/* Loading Placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-neutral-200/40 dark:bg-neutral-800/30 animate-pulse" />
        )}

        {/* Cinematic Overlays (Subtle) */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,0.05),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 ring-1 ring-white/10 pointer-events-none" />
      </div>

      {/* --- STATUS BADGE --- */}
      <div className="absolute left-4 top-4 z-20">
        <span
          className={[
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm border border-black/5',
            status === 'live' ? 'bg-emerald-400 text-black' : 'bg-amber-300 text-black',
          ].join(' ')}
        >
          {status === 'live' ? 'Live' : 'Demo'}
        </span>
      </div>

      {/* --- TEXT OVERLAY --- */}
      <div className="absolute inset-x-0 bottom-0 z-20 pt-24 pb-6 px-4 flex flex-col justify-end text-center
                      bg-gradient-to-t from-white via-white/95 to-transparent 
                      dark:from-black dark:via-black/95 dark:to-transparent
                      group-hover:opacity-0 transition-opacity duration-300 ease-in-out">

        <h3
          className={[
            'font-black text-black dark:text-white drop-shadow-sm',
            state === 'current' ? 'text-2xl sm:text-4xl md:text-5xl' : 'text-xl sm:text-2xl',
            'break-words whitespace-normal text-balance'
          ].join(' ')}
        >
          {project.title}
        </h3>

        {project.tagline && (
          <p className="mt-2 text-sm sm:text-base font-medium text-black/70 dark:text-white/70 line-clamp-2">
            {project.tagline}
          </p>
        )}
      </div>

    </motion.div>
  )
}
