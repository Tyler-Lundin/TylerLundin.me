"use client";

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Project, ProjectMedia } from '@/types/projects'
import { usePrefersDark } from '@/hooks/usePrefersDark'

function firstFeaturedMedia(media: ProjectMedia[], isDark: boolean): ProjectMedia | undefined {
  if (!media?.length) return undefined
  const pref: 'dark' | 'light' = isDark ? 'dark' : 'light'
  const byVariant = media.filter((m) => (m.variant ? m.variant === pref : true))
  return (
    byVariant.find((m) => m.featured) || byVariant[0] || media.find((m) => m.featured) || media[0]
  )
}

export default function ProjectsCard({ project, state, onClick }: { project: Project; state: 'prev'|'current'|'next'; onClick?: () => void }) {
  const isDark = usePrefersDark()
  const media = firstFeaturedMedia(project.media, isDark)
  const [isLoaded, setIsLoaded] = useState(false)
  if (!media) return null

  const status: 'live' | 'demo' = project.status ?? (project.links?.some((l) => l.type === 'live') ? 'live' : 'demo')

  const baseCls = 'group absolute top-1/2 -translate-y-1/2 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur shadow-2xl cursor-pointer select-none p-4 sm:p-8 max-w-[80vw]'
  const layout: Record<typeof state, string> = {
    prev: 'left-0 -translate-x-5/6 aspect-[9/11] scale-80 -rotate-3',
    current: 'left-1/2 -translate-x-1/2 aspect-[9/11]',
    next: 'right-0 translate-x-5/6 aspect-[9/11] scale-80 rotate-3',
  }
  const isCurrent = state === 'current'
  const scale = isCurrent ? 1 : 0.94
  const blur = isCurrent ? 'none' : 'blur-[1px] opacity-50'

  const onVisitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const live = project.links?.find((l) => l.type === 'live')?.url
    if (live) window.open(live, '_blank', 'noopener,noreferrer')
  }

  const isTallAuto = media.type === 'image' && (media.autoScroll ?? media.src.startsWith('/projects/')) && (media.scrollDirection ?? 'vertical') === 'vertical'

  const setPlaybackRate = (el: HTMLElement, rate: number) => {
    const targets = el.querySelectorAll('.pan-vert, .pan-horz')
    targets.forEach((t) => {
      const anims = (t as HTMLElement).getAnimations?.() ?? []
      anims.forEach((a) => {
        try {
          // @ts-ignore
          if (typeof a.updatePlaybackRate === 'function') a.updatePlaybackRate(rate)
          // @ts-ignore
          if ('playbackRate' in a) (a as any).playbackRate = rate
        } catch {}
      })
    })
  }

  return (
    <motion.div
      className={[`${baseCls} ${layout[state]} h-full`, isCurrent ? '' : 'saturate-[0.8] brightness-[0.95]'].join(' ')}
      style={{ zIndex: state === 'current' ? 3 : state === 'prev' ? 2 : 1 }}
      initial={false}
      animate={{ opacity: isCurrent ? 1 : 0.6, scale }}
      transition={{ type: 'spring', stiffness: 420, damping: 42, mass: 0.6 }}
      onClick={() => { if (onClick) { onClick() } else { window.location.href = `/project/${project.slug}` } }}
      role="link" tabIndex={0}
      onMouseEnter={(e) => setPlaybackRate(e.currentTarget as HTMLElement, 0.10)}
      onMouseLeave={(e) => setPlaybackRate(e.currentTarget as HTMLElement, .5)}
      onTouchStart={(e) => setPlaybackRate(e.currentTarget as HTMLElement, 0.10)}
      onTouchEnd={(e) => setPlaybackRate(e.currentTarget as HTMLElement, .5)}
    >
      <div className="absolute inset-0">
        {media.type === 'image' ? (
          isTallAuto ? (
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
              loading={state === 'current' ? 'eager' : 'lazy'}
              fetchPriority={state === 'current' ? 'high' : 'low'}
              decoding={state === 'current' ? 'auto' : 'async'}
              quality={state === 'current' ? 75 : 40}
              placeholder="empty"
              onLoadingComplete={() => setIsLoaded(true)}
              style={ media.scrollDurationMs ? ({ ['--pan-duration' as any]: `${media.scrollDurationMs}ms` } as any) : undefined }
            />
          )
        ) : (
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
        {!isLoaded && (
          <div className="absolute inset-0 bg-neutral-200/40 dark:bg-neutral-800/30 animate-pulse" />
        )}
        {/* Cinematic overlays to match bundles */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20 sm:from-black/80 sm:via-black/45 sm:to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,0.10),transparent_60%)]" />
        <div className="absolute inset-0 ring-1 ring-white/5" />
      </div>

      {/* Status badge */}
      <div className="absolute left-3 top-3 z-10">
        <span
          className={[
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm',
            status === 'live' ? 'bg-emerald-400 text-black' : 'bg-amber-300 text-black',
          ].join(' ')}
        >
          {status === 'live' ? 'Live' : 'Demo'}
        </span>
      </div>

      {/* Meta overlay */}
      <div className="absolute inset-x-0 bottom-0 h-full grid items-center px-4 text-black dark:text-white bg-gradient-to-b from-white/50 via-white/80 to-white dark:from-black/50 dark:via-black/80 dark:to-black group-hover:opacity-0 opacity-100 transition-all">
        <div className="flex text-center justify-center gap-3">
          <div className="min-w-0">
            <h3
              className={[
                // Responsive sizing (slightly smaller on mobile to avoid overflow)
                state === 'current' ? 'text-xl sm:text-3xl md:text-5xl' : 'text-lg sm:text-2xl md:text-3xl',
                // Wrapping behavior
                'font-black break-words whitespace-normal hyphens-auto text-balance drop-shadow',
                'max-w-full'
              ].join(' ')}
            >
              {project.title}
            </h3>
            {project.tagline && (
              <p className="mt-0.5 text-xs sm:text-sm text-black/85 dark:text-white/85 line-clamp-1">{project.tagline}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
