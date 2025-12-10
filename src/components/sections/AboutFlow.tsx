"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { aboutConfig } from '@/config/about';
import ContactCTA from '@/components/sections/ContactCTA';
import type { Project, ProjectMedia } from '@/types/projects';
import StickerTyler from '../StickerTyler';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: d } },
});

type Props = { projects: Project[] };

function pickFeaturedMedia(media: ProjectMedia[] | undefined) {
  if (!media?.length) return undefined;
  return media.find((m) => m.featured) || media[0];
}

function MetaChips({ role, location, availability }: { role?: string; location?: string; availability?: 'open' | 'limited' | 'closed' }) {
  if (!role && !location && !availability) return null;
  return (
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-2 text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-300 mb-3">
      {role && (
        <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 whitespace-nowrap">{role}</span>
      )}
      {location && (
        <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 whitespace-nowrap">{location}</span>
      )}
      {availability && (
        <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 whitespace-nowrap">Availability: {availability}</span>
      )}
    </div>
  );
}

function TitleBlock({ title, subtitle, tagline }: { title: string; subtitle?: string; tagline?: string }) {
  return (
    <div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 text-center md:text-left">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-center md:text-left">{subtitle}</p>
      )}
      {tagline && (
        <p className="mt-4 text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-prose mx-auto md:mx-0 text-center md:text-left">{tagline}</p>
      )}
    </div>
  );
}

function StatsChips({ stats }: { stats?: { label: string; value: string }[] }) {
  if (!stats?.length) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
      {stats.map((s) => (
        <span key={s.label} className="inline-flex items-center gap-1 rounded-full border border-black/10 dark:border-white/10 px-2 py-1 bg-white/70 dark:bg-white/5 backdrop-blur">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{s.value}</span>
          <span className="opacity-70">{s.label}</span>
        </span>
      ))}
    </div>
  );
}

function HeroImage({ src, alt }: { src: string; alt: string }) {
  return (
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
        <Image src={src} alt={alt} fill className="object-cover" priority />
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
  );
}

function IntroBlock({ paragraphs }: { paragraphs?: string[] }) {
  if (!paragraphs?.length) return null;
  return (
    <motion.div {...fadeUp(0)} className="lg:col-span-2">
      <h2 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-neutral-100">A little about me</h2>
      <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </motion.div>
  );
}

function FocusAside({ highlights, skills }: { highlights?: string[]; skills?: string[] }) {
  if (!highlights?.length && !skills?.length) return null;
  return (
    <motion.aside {...fadeUp(0.05)} className="lg:col-span-1">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-5">
        {highlights?.length ? (
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-wide uppercase">Focus</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-700 dark:bg-neutral-300" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {skills?.length ? (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-wide uppercase">Stack</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 text-xs text-neutral-700 dark:text-neutral-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
}

function ProjectCard({
  i,
  name,
  tagline,
  role,
  href,
  media,
  tech,
  slug,
  title,
}: {
  i: number;
  name?: string;
  tagline?: string;
  role?: string;
  href: string;
  media?: ProjectMedia;
  tech?: string[];
  slug?: string;
  title?: string;
}) {
  const isExternal = href.startsWith('http');
  return (
    <motion.a
      {...fadeUp(0.03 + i * 0.04)}
      key={slug || name}
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
                alt={media.alt ?? (title || name || '')}
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
                {name || title}
              </h3>
              {(tagline || undefined) && (
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">{tagline}</p>
              )}
            </div>
            {role && (
              <span className="shrink-0 max-w-[45%] sm:max-w-[35%] px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 text-xs overflow-hidden text-ellipsis whitespace-nowrap text-neutral-800 dark:text-neutral-200">
                {role}
              </span>
            )}
          </div>
          {tech?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tech.slice(0, 4).map((t) => (
                <span key={`${slug}-${t}`} className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 text-[11px] text-neutral-700 dark:text-neutral-300">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.a>
  );
}

function ProjectsSection({ projects, highlights }: { projects: Project[]; highlights?: { id?: string; name: string; role?: string; tagline?: string; href?: string }[] }) {
  if (!highlights?.length) return null;
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-neutral-100/60 to-transparent dark:via-white/[0.04]" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <motion.h2 {...fadeUp(0)} className="text-xl font-semibold mb-4">Selected Work</motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {highlights.map((p, i) => {
            const proj = projects.find((pp) => pp.slug === p.id || pp.id === p.id);
            const href = proj ? `/project/${proj.slug}` : p.href ?? '#';
            const media = proj ? pickFeaturedMedia(proj.media) : undefined;
            return (
              <ProjectCard
                key={proj?.slug || p.id || p.name}
                i={i}
                name={p.name}
                tagline={p.tagline || proj?.tagline}
                role={p.role}
                href={href}
                media={media}
                tech={proj?.tech}
                slug={proj?.slug}
                title={proj?.title}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
function PhilosophySection({ items }: { items?: string[] }) {
  if (!items?.length) return null;

  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  return (
    <div className="mx-auto max-w-7xl px-4 relative py-8">

      {/* Heading */}
      <motion.div {...fadeUp(0)} className="mb-6 sm:mb-8 relative">
        <h2 className="mt-1 text-xl sm:text-2xl font-semibold font-serif flex items-center gap-2">
          Philosophy
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            ∴
          </span>
        </h2>
      </motion.div>

      {/* Principles grid */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-5 relative bg-neutral-200 dark:bg-neutral-800 rounded-lg p-4">
        {items.map((line, i) => {
          const numeral = romanNumerals[i] ?? String(i + 1);

          return (
            <motion.div
              key={line}
              {...fadeUp(0.04 + i * 0.05)}
              className={`
                relative overflow-hidden
                rounded-2xl border border-neutral-200/70 dark:border-neutral-700/70
                bg-white/70 dark:bg-neutral-900/60
                backdrop-blur-sm px-4 py-4 sm:px-5 sm:py-5
                shadow-sm
              `}
            >

              {/* Corner glyph */}
              <span className="absolute right-3 top-3 text-[10px] uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
                αρχή
              </span>

              <div className="pl-3">
                <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-2">
                  Principle {numeral}
                  <span className="text-[9px] text-neutral-400/80 dark:text-neutral-500/80">
                    ∵
                  </span>
                </div>
                <div className="text-sm sm:text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-100">
                  {line}
                </div>
              </div>
            </motion.div>
          );
        })}
        {/* Thinking sticker */}
        <StickerTyler
          className="absolute bottom-0 right-0  scale-x-[-1] hidden md:block opacity-50"
          sticker="thinking"
          size={3}
        />

        <StickerTyler
          className="absolute bottom-0 right-0  scale-x-[-1] md:hidden block opacity-50"
          sticker="thinking"
          size={2}
        />
      </div>
    </div>
  );
}
export default function AboutFlow({ projects }: Props) {
  const a = aboutConfig;

  return (
    <section aria-label="About Tyler" className="relative">
      <div className="relative overflow-hidden bg-gradient-to-b from-neutral-50 via-white/60 to-transparent dark:from-black dark:via-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div {...fadeUp(0)}>
              <MetaChips role={a.role} location={a.location} availability={a.availability} />
              <TitleBlock title={a.title} subtitle={a.subtitle} tagline={a.tagline} />
              <StatsChips stats={a.stats} />
            </motion.div>

            <HeroImage src={a.images?.[0]?.src ?? '/images/tyler.png'} alt={a.images?.[0]?.alt ?? 'Tyler'} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          <IntroBlock paragraphs={a.intro} />
          <FocusAside highlights={a.highlights} skills={a.skills} />
        </div>
      </div>

      <ProjectsSection projects={projects} highlights={a.projectHighlights} />
      <PhilosophySection items={a.philosophy} />

      <ContactCTA />
    </section>
  );
}
