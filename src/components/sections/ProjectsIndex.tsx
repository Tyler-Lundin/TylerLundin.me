"use client";

import Link from 'next/link';
import Image from 'next/image';
import type { Project, ProjectMedia } from '@/types/projects';
import { usePrefersDark } from '@/hooks/usePrefersDark';
import { Sora } from "next/font/google";

const sora = Sora({ subsets: ["latin"], display: "swap" });

type Props = {
  title?: string;
  subtitle?: string;
  projects: Project[];
};

function pickFeaturedMedia(media: ProjectMedia[], isDark: boolean): ProjectMedia | undefined {
  if (!media?.length) return undefined;
  const pref: 'dark' | 'light' = isDark ? 'dark' : 'light';
  const filtered = media.filter((m) => (m.variant ? m.variant === pref : true));
  return filtered.find((m) => m.featured) || filtered[0] || media.find((m) => m.featured) || media[0];
}

export default function ProjectsIndex({ title, subtitle, projects }: Props) {
  const isDark = usePrefersDark();

  const sorted = [...projects].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));

  return (
    <section className="mx-auto max-w-5xl my-8">
      <div className="max-w-7xl mx-auto ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((p) => {
            const media = pickFeaturedMedia(p.media, isDark);
            const status: 'live' | 'demo' = p.status ?? (p.links?.some((l) => l.type === 'live') ? 'live' : 'demo');
            return (
              <Link
                key={p.slug}
                href={`/project/${p.slug}`}
                className="group relative rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20 transition-colors"
              >
                <div className="relative w-full aspect-[16/10]">
                  {media ? (
                    media.type === 'image' ? (
                      <Image
                        src={media.src}
                        alt={media.alt ?? p.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                        priority={false}
                      />
                    ) : (
                      <video
                        className="h-full w-full object-cover"
                        autoPlay muted loop playsInline
                      >
                        <source src={media.src} />
                      </video>
                    )
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute left-3 top-3">
                    <span
                      className={[
                        'inline-flex group-hover:opacity-20 transition-opacity items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                        status === 'live'
                          ? 'bg-emerald-400 text-black'
                          : 'bg-amber-300 text-black',
                      ].join(' ')}
                    >
                      {status === 'live' ? 'Live' : 'Demo'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {p.title}
                  </h3>
                  {p.tagline && (
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                      {p.tagline}
                    </p>
                  )}
                  {p.tech?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tech.slice(0, 4).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 text-[11px] text-neutral-700 dark:text-neutral-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
