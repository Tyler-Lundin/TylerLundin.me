"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { Project, ProjectMedia } from '@/types/projects';
import { projects as defaultProjects } from '@/data/projects';
import { usePrefersDark } from '@/hooks/usePrefersDark';
// stats overlay moved to a floating drawer; no overlay here

type SpotlightShowcaseProps = {
  projects?: Project[];
  className?: string;
  intervalMs?: number;
  initialDelayMs?: number;
};

function firstFeaturedMedia(media: ProjectMedia[], isDark: boolean): ProjectMedia | undefined {
  if (!media?.length) return undefined;
  const pref: 'dark' | 'light' = isDark ? 'dark' : 'light';
  const byVariant = media.filter((m) => (m.variant ? m.variant === pref : true));
  return (
    byVariant.find((m) => m.featured) ||
    byVariant[0] ||
    media.find((m) => m.featured) ||
    media[0]
  );
}

export default function SpotlightShowcase({
  projects,
  className,
  intervalMs = 10500,
  initialDelayMs = 1800,
}: SpotlightShowcaseProps) {
  const isDark = usePrefersDark();
  const slowRate = 0.20; // 75% slower on hover/hold
  const items = useMemo(() => {
    const source = projects ?? defaultProjects;
    return source
      .filter((p) => p.heroShowcase && p.media?.length)
      .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
  }, [projects]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startRef = useRef<NodeJS.Timeout | null>(null);
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});

  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(count, 1)), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + Math.max(count, 1)) % Math.max(count, 1)), [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    if (startRef.current) clearTimeout(startRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    startRef.current = setTimeout(() => {
      timerRef.current = setInterval(next, intervalMs);
    }, Math.max(0, initialDelayMs));
    return () => {
      if (startRef.current) clearTimeout(startRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, paused, next, intervalMs, initialDelayMs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  if (!count) return null;

  const current = items[index];
  const prevIdx = (index - 1 + count) % count;
  const nextIdx = (index + 1) % count;

  const buildCard = (project: Project, state: 'prev' | 'current' | 'next') => {
    const media = firstFeaturedMedia(project.media, isDark);
    if (!media) return null;

    const baseCls = 'group absolute top-1/2 -translate-y-1/2 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur';

    const layout: Record<typeof state, string> = {
      prev: 'left-[2%] w-[40%] sm:left-[4%] sm:w-[42%] md:left-[2%] md:w-[38%] lg:left-[2%] lg:w-[36%]',
      current: 'left-1/2 -translate-x-1/2 w-[86%] sm:w-[78%] md:w-[74%] lg:w-[70%] xl:w-[64%] 2xl:w-[60%]',
      next: 'right-[2%] w-[40%] sm:right-[4%] sm:w-[42%] md:right-[2%] md:w-[38%] lg:right-[2%] lg:w-[36%]',
    };

    const scale = state === 'current' ? 1 : 0.94;
    const opacity = state === 'current' ? 1 : 0.55;
    const blur = state === 'current' ? 'none' : 'blur-[1px]';

    const onVisitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const live = project.links?.find((l) => l.type === 'live')?.url;
      if (live) window.open(live, '_blank', 'noopener,noreferrer');
    };

    const key = media.src;
    const isLoaded = !!loadedMap[key];
    const markLoaded = () =>
      setLoadedMap((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

    const isTallAuto =
      media.type === 'image' &&
      (media.autoScroll ?? media.src.startsWith('/projects/')) &&
      (media.scrollDirection ?? 'vertical') === 'vertical';

    const setPlaybackRate = (el: HTMLElement, rate: number) => {
      const targets = el.querySelectorAll('.pan-vert, .pan-horz');
      targets.forEach((t) => {
        const anims = (t as HTMLElement).getAnimations?.() ?? [];
        anims.forEach((a) => {
          try {
            // Some browsers support updatePlaybackRate; fallback to setting playbackRate
            // @ts-ignore
            if (typeof a.updatePlaybackRate === 'function') a.updatePlaybackRate(rate);
            // @ts-ignore
            if ('playbackRate' in a) (a as any).playbackRate = rate;
          } catch {}
        });
      });
    };

    return (
      <motion.div
        key={`${project.id}-${state}`}
        className={`${baseCls} ${layout[state]} aspect-[16/10] shadow-lg`}
        style={{ zIndex: state === 'current' ? 3 : state === 'prev' ? 2 : 1 }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity, scale }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        onClick={() => {
          window.location.href = `/project/${project.slug}`;
        }}
        role="link"
        tabIndex={0}
        onMouseEnter={(e) => setPlaybackRate(e.currentTarget as HTMLElement, slowRate)}
        onMouseLeave={(e) => setPlaybackRate(e.currentTarget as HTMLElement, 1)}
        onTouchStart={(e) => setPlaybackRate(e.currentTarget as HTMLElement, slowRate)}
        onTouchEnd={(e) => setPlaybackRate(e.currentTarget as HTMLElement, 1)}
      >
        <div className="absolute inset-0">
          {media.type === 'image' ? (
            isTallAuto ? (
              <img
                src={media.src}
                alt={media.alt ?? project.title}
                className={`absolute left-0 top-0 w-full h-auto pan-vert ${blur} ${state !== 'current' && !isLoaded ? 'blur-md' : ''}`}
                style={{
                  ...(media.scrollDurationMs
                    ? ({ ['--pan-duration' as any]: `${media.scrollDurationMs}ms` } as any)
                    : {}),
                  // Increase travel to reveal near-full height
                  ['--pan-amount' as any]: '-60%'
                }}
                onLoad={markLoaded}
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
                onLoadingComplete={markLoaded}
                style={
                  media.scrollDurationMs
                    ? ({ ['--pan-duration' as any]: `${media.scrollDurationMs}ms` } as any)
                    : undefined
                }
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
              onLoadedData={markLoaded}
            >
              <source src={media.src} />
            </video>
          )}
          {!isLoaded && (
            <div className="absolute inset-0 bg-neutral-200/40 dark:bg-neutral-800/30 animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Meta overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold truncate drop-shadow">
                {project.title}
              </h3>
              {project.tagline && (
                <p className="mt-0.5 text-xs sm:text-sm text-white/85 line-clamp-1">
                  {project.tagline}
                </p>
              )}
            </div>
            {project.links?.find((l) => l.type === 'live')?.url && (
              <button
                aria-label="Open live site"
                onClick={onVisitClick}
                className="shrink-0 inline-flex items-center gap-2 rounded-md bg-white/90 text-neutral-900 px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-white transition-colors"
              >
                Visit
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section
      aria-label="Spotlight project showcase"
      className={[
        'w-full relative z-10 select-none',
        className,
      ].filter(Boolean).join(' ')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Stage with side peeks */}
        <div className="relative aspect-[16/9] sm:aspect-[16/9] md:aspect-[16/9] lg:aspect-[16/9] mt-4">
          <AnimatePresence initial={false}>
            {buildCard(items[prevIdx], 'prev')}
            {buildCard(current, 'current')}
            {buildCard(items[nextIdx], 'next')}
          </AnimatePresence>

          {/* Controls */}
          {count > 1 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 z-40">
              <button
                aria-label="Previous project"
                className="pointer-events-auto rounded-full bg-black/50 hover:bg-black/70 text-white p-2 backdrop-blur border border-white/20"
                onClick={prev}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button
                aria-label="Next project"
                className="pointer-events-auto rounded-full bg-black/50 hover:bg-black/70 text-white p-2 backdrop-blur border border-white/20"
                onClick={next}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          )}

          {/* Progress dots with titles on hover */}
          {count > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {items.map((p, i) => {
                const activeDot = isDark ? 'bg-white' : 'bg-black';
                const inactiveDot = isDark ? 'bg-white/50 hover:bg-white/70' : 'bg-black/50 hover:bg-black/70';
                return (
                  <button
                    key={p.id}
                    aria-label={`Go to ${p.title}`}
                    className={`h-1.5 rounded-full transition-all ${i === index ? `w-6 ${activeDot}` : `w-2 ${inactiveDot}`}`}
                    onClick={() => setIndex(i)}
                  />
                );
              })}
            </div>
          )}

          
        </div>
      </div>
    </section>
  );
}
