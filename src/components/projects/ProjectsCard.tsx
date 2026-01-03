"use client";

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Project, ProjectMedia } from '@/types/projects'
import { usePrefersDark } from '@/hooks/usePrefersDark'

// Helper to pick the best media based on dark/light mode and featured status
function firstFeaturedMedia(media: ProjectMedia[], isDark: boolean): ProjectMedia | undefined {
  if (!media?.length) return undefined
  const pref: 'dark' | 'light' = isDark ? 'dark' : 'light'
  // 1. Match preference, 2. Fallback to any
  const byVariant = media.filter((m) => (m.variant ? m.variant === pref : true))
  // 3. Find featured in filtered, 4. First in filtered, 5. Featured in all, 6. First in all
  return (
    byVariant.find((m) => m.featured) || byVariant[0] || media.find((m) => m.featured) || media[0]
  )
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
  const media = firstFeaturedMedia(project.media, isDark)
  const [isLoaded, setIsLoaded] = useState(false)

  if (!media) return null

  // Determine status (Live vs Demo)
  const status: 'live' | 'demo' = project.status ?? (project.links?.some((l) => l.type === 'live') ? 'live' : 'demo')

  // Layout & Animation Constants
  const baseCls = 'group absolute top-1/2 -translate-y-1/2 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur shadow-2xl cursor-pointer select-none max-w-[80vw]'
  
  // Adjusted aspect ratios and positioning
  const layout: Record<typeof state, string> = {
    prev: 'left-0 -translate-x-1/2 scale-90 -rotate-3 z-10 brightness-[0.6] blur-[1px]',
    current: 'left-1/2 -translate-x-1/2 z-30 brightness-100 blur-0',
    next: 'right-0 translate-x-1/2 scale-90 rotate-3 z-20 brightness-[0.6] blur-[1px]',
  }

  const isCurrent = state === 'current'
  const scale = isCurrent ? 1 : 0.94
  // Dim non-active cards slightly
  const inactiveFilter = isCurrent ? '' : 'saturate-[0.8] brightness-[0.95]'
  const blur = isCurrent ? 'none' : 'blur-[1px] opacity-50'

  // Cinematic "Pan" Logic
  const isTallAuto = media.type === 'image' && (media.autoScroll ?? media.src.startsWith('/projects/')) && (media.scrollDirection ?? 'vertical') === 'vertical'

  const setPlaybackRate = (el: HTMLElement, rate: number) => {
    const targets = el.querySelectorAll('.pan-vert, .pan-horz')
    targets.forEach((t) => {
      const anims = (t as HTMLElement).getAnimations?.() ?? []
      anims.forEach((a) => {
        try {
          // @ts-ignore - TS doesn't always know about updatePlaybackRate
          if (typeof a.updatePlaybackRate === 'function') a.updatePlaybackRate(rate)
          // @ts-ignore
          if ('playbackRate' in a) (a as any).playbackRate = rate
        } catch (err) {
            // safely ignore animation errors
        }
      })
    })
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
      // Slow down pan on enter, speed up on leave
      onMouseEnter={(e) => setPlaybackRate(e.currentTarget as HTMLElement, 0.10)}
      onMouseLeave={(e) => setPlaybackRate(e.currentTarget as HTMLElement, 0.5)}
      onTouchStart={(e) => setPlaybackRate(e.currentTarget as HTMLElement, 0.10)}
      onTouchEnd={(e) => setPlaybackRate(e.currentTarget as HTMLElement, 0.5)}
    >
      {/* --- MEDIA LAYER --- */}
      <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900">
        {media.type === 'image' ? (
          isTallAuto ? (
            /* CSS Animated Image (Standard img for simpler CSS control) */
            <img
              src={media.src}
              alt={media.alt ?? project.title}
              className={`absolute left-0 top-0 w-full h-auto pan-vert ${blur} ${state !== 'current' && !isLoaded ? 'blur-md' : ''}`}
              style={{
                ...(media.scrollDurationMs ? ({ ['--pan-duration' as any]: `${media.scrollDurationMs}ms` } as any) : {}),
                ['--pan-amount' as any]: '-60%'
              }}
              onLoad={() => setIsLoaded(true)}
            />
          ) : (
            /* Next.js Optimized Image */
            <Image
              src={media.src}
              alt={media.alt ?? project.title}
              fill
              sizes="(min-width: 1536px) 60vw, (min-width: 1280px) 64vw, (min-width: 1024px) 70vw, (min-width: 768px) 74vw, (min-width: 640px) 78vw, 86vw"
              className={[
                'object-cover',
                (media.autoScroll ?? media.src.startsWith('/projects/'))
                  ? [media.scrollDirection === 'horizontal' ? 'pan-horz' : 'pan-vert', media.scrollDirection === 'horizontal' ? 'object-center' : 'object-top'].join(' ')
                  : '',
                blur,
                state !== 'current' && !isLoaded ? 'blur-md' : '',
              ].join(' ')}
              priority={state === 'current'}
              fetchPriority={state === 'current' ? 'high' : 'auto'}
              loading={state === 'current' ? 'eager' : 'lazy'}
              quality={state === 'current' ? 75 : 40}
              onLoadingComplete={() => setIsLoaded(true)}
              style={ media.scrollDurationMs ? ({ ['--pan-duration' as any]: `${media.scrollDurationMs}ms` } as any) : undefined }
            />
          )
        ) : (
          /* Video Handling */
          <video
            className={`h-full w-full object-cover ${blur} ${state !== 'current' && !isLoaded ? 'blur-md' : ''}`}
            autoPlay={state === 'current' ? (media.autoplay ?? true) : false}
            loop={media.loop ?? true}
            muted={media.muted ?? true}
            playsInline={media.playsInline ?? true}
            preload={state === 'current' ? 'metadata' : 'none'}
            poster={media.poster}
            onLoadedData={() => setIsLoaded(true)}
          >
            <source src={media.src} />
          </video>
        )}

        {/* Loading Placeholder */ }
        {!isLoaded && (
          <div className="absolute inset-0 bg-neutral-200/40 dark:bg-neutral-800/30 animate-pulse" />
        )}

        {/* Cinematic Overlays (Subtle) */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,0.10),transparent_60%)] pointer-events-none" />
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

      {/* --- TEXT OVERLAY (Refactored) --- */}
      {/* Only covers bottom, gradient fade, hides on hover to show image */}
      <div className="absolute inset-x-0 bottom-0 z-20 pt-24 pb-6 px-4 flex flex-col justify-end text-center
                      bg-gradient-to-t from-white via-white/90 to-transparent 
                      dark:from-black dark:via-black/90 dark:to-transparent
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
