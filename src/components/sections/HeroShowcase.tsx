"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import type { Project, ProjectMedia } from '@/types/projects';
import { projects as defaultProjects } from '@/data/projects';
import { usePrefersDark } from '@/hooks/usePrefersDark';

type HeroShowcaseProps = {
  projects?: Project[];
  className?: string;
  showHeader?: boolean;
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

export function HeroShowcase({ projects, className, showHeader = true }: HeroShowcaseProps) {
  const isDark = usePrefersDark();
  const items = useMemo(() => {
    const source = projects ?? defaultProjects;
    return source
      .filter((p) => p.heroShowcase && p.media?.length)
      .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
  }, [projects]);

  if (!items.length) return null;

  return (
    <section
      aria-label="Featured project showcase"
      className={[
        "w-full relative z-10",
        "pt-8 pb-6 sm:pt-10 sm:pb-8 md:pt-12 md:pb-10",
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="mx-auto max-w-6xl px-4">
        {showHeader && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
              Recent Work
            </h2>
            <Link
              href="#projects"
              className="text-sm text-neutral-800 dark:text-neutral-200 hover:underline"
            >
              View all
            </Link>
          </div>
        )}

        <div className="[mask-image:linear-gradient(to_right,transparent,black_8rem,black_calc(100%-8rem),transparent)] overflow-x-auto">
          <ul className="flex gap-4 sm:gap-6 snap-x snap-mandatory pb-2 cursor-grab active:cursor-grabbing select-none">
            {items.map((project) => {
              const media = firstFeaturedMedia(project.media, isDark);
              if (!media) return null;

              const liveLink = project.links?.find((l) => l.type === 'live')?.url;

              const CardContent = (
                <div className="group relative w-[88vw] sm:w-[75vw] md:w-[70vw] lg:w-[min(66vw,768px)] xl:w-[min(66vw,864px)] 2xl:w-[min(66vw,960px)] aspect-[16/10] snap-start overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur">
                  {/* Media */}
                  <div className="absolute inset-0">
                    {media.type === 'image' ? (
                      <Image
                        src={media.src}
                        alt={media.alt ?? project.title}
                        fill
                        sizes="(min-width: 1536px) min(66vw,960px), (min-width: 1280px) min(66vw,864px), (min-width: 1024px) min(66vw,768px), (min-width: 640px) 75vw, 88vw"
                        className={[
                          'object-cover',
                          // Enable gentle vertical pan for tall local screenshots under /projects
                          (media.autoScroll ?? media.src.startsWith('/projects/'))
                            ? [media.scrollDirection === 'horizontal' ? 'pan-horz' : 'pan-vert', media.scrollDirection === 'horizontal' ? 'object-center' : 'object-top'].join(' ')
                            : '',
                        ].join(' ')}
                        priority
                        style={
                          media.scrollDurationMs
                            ? ({ ['--pan-duration' as any]: `${media.scrollDurationMs}ms` } as any)
                            : undefined
                        }
                      />
                    ) : (
                      <video
                        className="h-full w-full object-cover"
                        autoPlay={media.autoplay ?? true}
                        loop={media.loop ?? true}
                        muted={media.muted ?? true}
                        playsInline={media.playsInline ?? true}
                        poster={media.poster}
                      >
                        <source src={media.src} />
                      </video>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  </div>

                  {/* Meta */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
                    <h3 className="text-base sm:text-lg font-semibold drop-shadow">
                      {project.title}
                    </h3>
                    {project.tagline && (
                      <p className="mt-0.5 text-xs sm:text-sm text-white/80 line-clamp-1">
                        {project.tagline}
                      </p>
                    )}
                  </div>
                </div>
              );

              return (
                <li key={project.id} className="shrink-0">
                  {liveLink ? (
                    <a href={liveLink} target="_blank" rel="noreferrer noopener" aria-label={project.title}>
                      {CardContent}
                    </a>
                  ) : (
                    CardContent
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default HeroShowcase;
