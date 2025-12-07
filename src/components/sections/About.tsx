'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { aboutConfig } from '@/config/about';

export function About() {
  const { title, subtitle, tagline, intro, images, highlights, skills, ctas, location, role, availability, stats, projectHighlights, philosophy, socials } = aboutConfig;

  return (
    <section id="about" className="py-24 sm:py-28 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-7 md:space-y-8 text-center md:text-left"
          >
            <div>
              <h2 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 dark:from-cyan-300 dark:via-pink-400 dark:to-purple-400 tracking-tight pb-4 border-b border-black/10 dark:border-white/10 relative inline-block">
                {title}
                {subtitle && (
                  <small className="absolute top-0 -translate-y-full md:left-0 md:translate-x-0 left-1/2 -translate-x-1/2 text-sm text-neutral-700 dark:text-neutral-300 opacity-90">
                    {subtitle}
                  </small>
                )}
              </h2>
              {tagline && (
                <p className="text-md italic font-medium text-neutral-700 dark:text-neutral-300 pb-4 border-b border-black/10 dark:border-white/10">
                  {tagline}
                </p>
              )}
            </div>

            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {role && <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10">{role}</span>}
                {location && <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10">{location}</span>}
                {availability && (
                  <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10">
                    Availability: {availability}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-5 mt-3">
              {intro.map((paragraph, idx) => (
                <p key={idx} className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed opacity-90">
                  {paragraph}
                </p>
              ))}
            </div>

            {stats?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-lg border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-4 text-center">
                    <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{s.value}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{s.label}</div>
                    {('helperText' in s && (s as any).helperText) ? (
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">{(s as any).helperText}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Highlights / Skills / CTAs */}
            {(highlights?.length || skills?.length || ctas?.length) && (
              <div className="pt-2 space-y-5">
                {highlights?.length ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    {highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-700 dark:bg-neutral-300" />
                        {h}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 text-xs text-neutral-700 dark:text-neutral-300">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}

                {ctas?.length ? (
                  <div className="flex flex-wrap gap-3">
                    {ctas.map((c) => (
                      <a key={c.href} href={c.href} className="inline-flex items-center gap-2 rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm hover:opacity-90">
                        {c.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>

          {/* Images: map through and render as a responsive grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 content-start"
          >
            {images.map((img, idx) => (
              <div
                key={img.src + idx}
                className={[
                  'relative w-full aspect-square overflow-hidden border border-black/10 dark:border-white/10',
                  img.rounded ? 'rounded-full' : 'rounded-xl',
                ].join(' ')}
              >
                <Image
                  src={img.src}
                  alt={img.alt ?? ''}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Project highlights */}
        {projectHighlights?.length ? (
          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-4">Selected Work</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projectHighlights.map((p) => (
                <a key={p.name} href={p.href ?? '#'} className="group relative rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-4 hover:border-black/20 dark:hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:underline">{p.name}</div>
                      {p.tagline && <div className="text-sm text-neutral-600 dark:text-neutral-300">{p.tagline}</div>}
                    </div>
                    {p.role && <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 text-xs">{p.role}</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {/* Philosophy */}
        {philosophy?.length ? (
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-3">Philosophy</h3>
            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 list-disc pl-5">
              {philosophy.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Socials */}
        {socials?.length ? (
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-3">Find me</h3>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a key={s.href} href={s.href} target={s.platform === 'email' ? undefined : '_blank'} rel={s.platform === 'email' ? undefined : 'noreferrer noopener'} className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 px-3 py-1.5 text-sm hover:border-black/20 dark:hover:border-white/20">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
