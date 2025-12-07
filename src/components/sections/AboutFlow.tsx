"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { aboutConfig } from '@/config/about';
import ContactCTA from '@/components/sections/ContactCTA';
import type { Project, ProjectMedia } from '@/types/projects';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: d } },
});

type Props = { projects: Project[] };

function pickFeaturedMedia(media: ProjectMedia[] | undefined) {
  if (!media?.length) return undefined;
  return media.find((m) => m.featured) || media[0];
}

export default function AboutFlow({ projects }: Props) {
  const a = aboutConfig;

  return (
    <section aria-label="About Tyler" className="relative">
      <div className="relative overflow-hidden bg-gradient-to-b from-neutral-50 via-white/60 to-transparent dark:from-black dark:via-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div {...fadeUp(0)}>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-2 text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-300 mb-3">
                {a.role && (
                  <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 whitespace-nowrap">
                    {a.role}
                  </span>
                )}
                {a.location && (
                  <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 whitespace-nowrap">
                    {a.location}
                  </span>
                )}
                {a.availability && (
                  <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 whitespace-nowrap">
                    Availability: {a.availability}
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 text-center md:text-left">{a.title}</h1>
              {a.subtitle && (
                <p className="mt-1 text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-center md:text-left">{a.subtitle}</p>
              )}
              {a.tagline && (
                <p className="mt-4 text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-prose mx-auto md:mx-0 text-center md:text-left">{a.tagline}</p>
              )}

              {a.stats?.length ? (
                <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                  {a.stats.map((s) => (
                    <span key={s.label} className="inline-flex items-center gap-1 rounded-full border border-black/10 dark:border-white/10 px-2 py-1 bg-white/70 dark:bg-white/5 backdrop-blur">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">{s.value}</span>
                      <span className="opacity-70">{s.label}</span>
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="relative mx-auto w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-500/20 blur-2xl z-0" />

              <motion.div
                className="pointer-events-none absolute inset-0 z-20 origin-center"
                aria-hidden
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                transition={{ opacity: { duration: 0.5, delay: 0.12 }, rotate: { duration: 80, repeat: Infinity, ease: 'linear' } }}
              >
                <motion.span className="absolute -inset-3 rounded-full border-2 border-cyan-400/60 translate-x-1.5 translate-y-1.5 blur-[0.5px] mix-blend-screen" />
                <motion.span className="absolute -inset-3 rounded-full border-2 border-rose-500/70 -translate-x-1.5 -translate-y-1.5 blur-[0.5px] mix-blend-screen" />
              </motion.div>

              <div className="relative z-10 w-full h-full rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur">
                <Image src={a.images?.[0]?.src ?? '/images/tyler.png'} alt={a.images?.[0]?.alt ?? 'Tyler'} fill className="object-cover" priority />
                {/* Edge fade to background (light/dark) */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-full z-10 dark:hidden"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(255,255,255,0) 55%, rgba(255,255,255,0.6) 80%, rgba(255,255,255,0.95) 100%)',
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-full z-10 hidden dark:block"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.95) 100%)',
                  }}
                />
                <div className="absolute inset-0 rounded-full ring-1 ring-white/30 dark:ring-white/10 z-20" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          <motion.div {...fadeUp(0)} className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-100">A little about me</h2>
            <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {a.intro?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>

          {(a.highlights?.length || a.skills?.length) && (
            <motion.aside {...fadeUp(0.05)} className="lg:col-span-1">
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-5">
                {a.highlights?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-wide uppercase">Focus</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {a.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-700 dark:bg-neutral-300" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {a.skills?.length ? (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-wide uppercase">Stack</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.skills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 text-xs text-neutral-700 dark:text-neutral-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.aside>
          )}
        </div>
      </div>

      {a.projectHighlights?.length ? (
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-neutral-100/60 to-transparent dark:via-white/[0.04]" />
          <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
            <motion.h2 {...fadeUp(0)} className="text-xl font-semibold mb-4">Selected Work</motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {a.projectHighlights.map((p, i) => {
                const proj = projects.find((pp) => pp.slug === p.id || pp.id === p.id);
                const href = proj ? `/project/${proj.slug}` : p.href ?? '#';
                const isExternal = !proj && !!p.href && p.href.startsWith('http');
                const media = proj ? pickFeaturedMedia(proj.media) : undefined;
                return (
                  <motion.a
                    {...fadeUp(0.03 + i * 0.04)}
                    key={proj?.slug || p.id || p.name}
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noreferrer noopener' : undefined}
                    className="group block rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20 transition-colors"
                  >
                    <div className="contents">
                      <div className="relative w-full aspect-[16/10]">
                        {media ? (
                          media.type === 'image' ? (
                            <Image
                              src={media.src}
                              alt={media.alt ?? (proj?.title || p.name)}
                              fill
                              sizes="(min-width: 1024px) 33vw, 50vw"
                              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <video className="h-full w-full object-cover" autoPlay muted loop playsInline>
                              <source src={media.src} />
                            </video>
                          )
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:underline">
                              {p.name || proj?.title}
                            </h3>
                            {(p.tagline || proj?.tagline) && (
                              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                                {p.tagline || proj?.tagline}
                              </p>
                            )}
                          </div>
                          {p.role && (
                            <span className="shrink-0 max-w-[45%] sm:max-w-[35%] px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 text-xs overflow-hidden text-ellipsis whitespace-nowrap text-neutral-800 dark:text-neutral-200">
                              {p.role}
                            </span>
                          )}
                        </div>
                        {proj?.tech?.length ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {proj.tech.slice(0, 4).map((t) => (
                              <span key={`${proj.slug}-${t}`} className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 text-[11px] text-neutral-700 dark:text-neutral-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {a.philosophy?.length ? (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <motion.h2 {...fadeUp(0)} className="text-xl font-semibold mb-4">Philosophy</motion.h2>
          <div className="grid md:grid-cols-3 gap-4">
            {a.philosophy.map((line, i) => (
              <motion.div
                key={line}
                {...fadeUp(0.02 + i * 0.04)}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4"
              >
                <div className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Principle {i + 1}</div>
                <div className="text-neutral-800 dark:text-neutral-100">{line}</div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}

        <ContactCTA />
    </section>
  );
}
