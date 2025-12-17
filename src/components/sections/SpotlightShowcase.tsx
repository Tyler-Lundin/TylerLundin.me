"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { Project, ProjectMedia } from '@/types/projects';
import { projects as defaultProjects } from '@/data/projects';
import { usePrefersDark } from '@/hooks/usePrefersDark';
// stats overlay moved to a floating drawer; no overlay here
//
//
//


const [on,off] = [true,false]
const DE = (i:number) => (off ? i : 0)
const BUG = {
  root: DE(1),
  controls: DE(1)
}


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
  const slowRate = 0.10; // 75% slower on hover/hold
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
      prev: 'left-[0%] w-[40%] sm:left-[4%] sm:w-[42%] md:left-[2%] md:w-[38%] lg:left-[2%] lg:w-[36%]',
      current: 'left-1/2 -translate-x-1/2 w-[86%] sm:w-[78%] md:w-[74%] lg:w-[70%] xl:w-[64%] 2xl:w-[60%]',
      next: 'right-[0%] w-[40%] sm:right-[4%] sm:w-[42%] md:right-[2%] md:w-[38%] lg:right-[2%] lg:w-[36%]',
    };

    const scale = state === 'current' ? 1 : 0.94;
    const opacity = state === 'current' ? 1 : 1;
    const blur = state === 'current' ? 'none' : 'blur-[1px] opacity-50';

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
          } catch { }
        });
      });
    };

    return (
      <motion.div
        key={`${project.id}-${state}`}
        className={`${baseCls} ${layout[state]} aspect-[16/14] sm:aspect-[16/11] md:aspect-[16/10] lg:aspect-[16/9] shadow-lg`}
        style={{ zIndex: state === 'current' ? 3 : state === 'prev' ? 2 : 1 }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity, scale }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        onClick={() => {
          window.location.href = `/project/${project.slug}`;
        }}
        role="link" tabIndex={0}
        onMouseEnter={(e) => setPlaybackRate(e.currentTarget as HTMLElement, slowRate)}
        onMouseLeave={(e) => setPlaybackRate(e.currentTarget as HTMLElement, .5)}
        onTouchStart={(e) => setPlaybackRate(e.currentTarget as HTMLElement, slowRate)}
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
        <div className="absolute inset-x-0 bottom-0 h-full grid items-center px-4 text-black dark:text-white bg-gradient-to-b from-white/50 via-white/80 to-white dark:from-black/50 dark:via-black/80 dark:to-black group-hover:opacity-0 opacity-100 transition-all">
          <div className="flex text-center justify-center gap-3">
            <div className="min-w-0">
              <h3 className={[
                state === 'current' ? "text-2xl md:text-3xl lg:text-5xl" : "",
                "font-black truncate drop-shadow"
              ].join(" ")}>
                {project.title}
              </h3>
              {project.tagline && (
                <p className="mt-0.5 text-xs sm:text-sm text-black/85 dark:text-white/85 line-clamp-1">
                  {project.tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section
      aria-label="Spotlight project showcase"
      className={[
        'w-full relative z-10 select-none h-min ',
        BUG.root && "border border-red-400",
        className,
      ].filter(Boolean).join(' ')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Stage with side peeks */}

          {/* Controls */}
          {count > 1 && <Controls {... {prev, next}}/>}
        <div className="relative aspect-[16/11] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[16/8] ">
          <AnimatePresence initial={false}>
            {buildCard(items[prevIdx], 'prev')}
            {buildCard(current, 'current')}
            {buildCard(items[nextIdx], 'next')}
          </AnimatePresence>


          {/* Progress dots with titles on hover */}
          {count > 1 && (
            <div className="absolute bottom-0  left-1/2 -translate-x-1/2 flex gap-2">
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


function Controls({ prev, next }: { prev: () => void; next: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <div className="absolute inset-x-2 bottom-2 flex items-end justify-between sm:inset-x-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:px-2">
        <NavButton dir="left" label="Previous project" onClick={prev} />
        <NavButton dir="right" label="Next project" onClick={next} />
      </div>
    </div>
  );
}

function NavButton({
  dir,
  label,
  onClick,
}: {
  dir: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const isLeft = dir === "left";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        "pointer-events-auto select-none",
        // big tap target (mobile) + slightly slimmer (desktop)
        "h-12 w-14 sm:h-12 sm:w-12",
        // “handle” shape that hugs the edge
        isLeft ? "rounded-2xl rounded-l-3xl" : "rounded-2xl rounded-r-3xl",
        // visible by default on desktop (no hover dependency)
        "opacity-100 sm:opacity-80 hover:sm:opacity-100",
        // glassy + clean
        "backdrop-blur-xl",
        "bg-white/10 hover:bg-white/14",
        "border border-white/15",
        "shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
        "transition duration-200 active:scale-[0.96]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30",
        // micro “edge pull” so it feels like it’s attached to the carousel wall
        isLeft ? "sm:-translate-x-1" : "sm:translate-x-1",
        "grid place-items-center",
      ].join(" ")}
    >
      <Chevron dir={dir} />
    </button>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  const isLeft = dir === "left";
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="dark:text-white/90 text-black/90"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isLeft ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}
