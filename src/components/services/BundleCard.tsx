import { Bundle } from "@/services"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"


  const themeFor = (slug: string) => {
    switch (slug) {
      case 'launch':
        return {
          bg: 'bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-950 dark:to-teal-900',
          accentText: 'text-emerald-900 dark:text-emerald-200',
          badge: 'border-emerald-600/30 bg-emerald-50/90 dark:bg-emerald-900/25',
          bestFor: 'New sites, fast launch, marketing pages',
          ribbon: 'Popular'
        }
      case 'operate':
        return {
          bg: 'bg-gradient-to-br from-indigo-100 to-violet-200 dark:from-indigo-950 dark:to-violet-900',
          accentText: 'text-indigo-900 dark:text-indigo-200',
          badge: 'border-indigo-600/30 bg-indigo-50/90 dark:bg-indigo-900/25',
          bestFor: 'Internal tools, portals, role-based areas',
          ribbon: 'Pro'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-950 dark:to-neutral-900',
          accentText: 'text-neutral-900 dark:text-neutral-200',
          badge: 'border-neutral-500/30 bg-white/80 dark:bg-neutral-800/30',
          bestFor: 'Modern web foundations',
          ribbon: ''
        }
    }
  }

export default function BundleCard({
  item,
  state,
}: {
  item: Bundle
  state: 'prev' | 'current' | 'next'
}) {
  const baseCls =
    'group absolute top-1/2 -translate-y-1/2 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl cursor-pointer select-none'

  const layout: Record<typeof state, string> = {
    prev: 'left-[2%] w-[40%] sm:left-[4%] sm:w-[42%] md:left-[2%] md:w-[38%] lg:left-[2%] lg:w-[36%]',
    current:
      'left-1/2 -translate-x-1/2 w-[86%] sm:w-[78%] md:w-[74%] lg:w-[70%] xl:w-[64%] 2xl:w-[60%]',
    next: 'right-[2%] w-[40%] sm:right-[4%] sm:w-[42%] md:right-[2%] md:w-[38%] lg:right-[2%] lg:w-[36%]',
  }

  const isCurrent = state === 'current'
  const scale = isCurrent ? 1 : 0.94
  const opacity = isCurrent ? 1 : 0.6

  const open = () => (window.location.href = `/services#bundles`)
  const theme = themeFor(item.slug)

  // Mobile-friendly caps: keep poster vibe without becoming a brochure
  const bullets = (item.features ?? []).slice(0, 2)
  const shortTags = (item.tags ?? []).slice(0, 2)
  const includes = (item.serviceSlugs ?? []).slice(0, 4)

  return (
    <motion.div
      key={`${item.slug}-${state}`}
      className={[
        baseCls,
        layout[state],
        'h-full',
        isCurrent ? '' : 'saturate-[0.8] brightness-[0.95]',
      ].join(' ')}
      style={{ zIndex: state === 'current' ? 3 : state === 'prev' ? 2 : 1 }}
      initial={false}
      animate={{ opacity, scale }}
      transition={{ type: 'spring', stiffness: 420, damping: 42, mass: 0.6 }}
      onClick={open}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') open()
      }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {item.bgImg ? (
          <Image
            src={item.bgImg}
            fill
            alt={`${item.title} bundle`}
            className={[
              'object-cover',
              isCurrent ? 'opacity-100' : 'opacity-80',
              'transition-opacity duration-200',
              item.className ?? '',
            ].join(' ')}
            priority={isCurrent}
          />
        ) : (
          <div className={['absolute inset-0', theme.bg].join(' ')} />
        )}

        {/* Cinematic overlays (mobile slightly darker for readability) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20 sm:from-black/80 sm:via-black/45 sm:to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,0.10),transparent_60%)]" />
        <div className="absolute inset-0 ring-1 ring-white/5" />
      </div>

      {/* Top meta (quiet) */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between p-3.5 sm:p-6">
        <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium tracking-wide text-white/90 ring-1 ring-white/15">
          {item.title.split(' ')[0]} bundle
        </span>

        {item.priceRange ? (
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] sm:text-xs font-semibold bg-white/10 text-white ring-1 ring-white/15">
            {item.priceRange}
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Bottom content (poster-style) */}
      <div
        className={[
          'relative z-10 flex h-full flex-col justify-end',
          isCurrent ? 'p-4 sm:p-7' : 'p-3.5 sm:p-5', // compressed on mobile
        ].join(' ')}
      >
        <div className="max-w-3xl">
          <div className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium tracking-[0.22em] uppercase text-white/70">
            Best for: <span className="text-white/85">{theme.bestFor}</span>
          </div>

          <h3
            className={[
              'font-extrabold tracking-tight text-white',
              isCurrent
                ? 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.98]'
                : 'text-xl sm:text-3xl md:text-4xl leading-[1.0]',
            ].join(' ')}
          >
            {item.title}
          </h3>

          {item.summary ? (
            <p
              className={[
                'mt-2 sm:mt-3 text-white/80',
                isCurrent ? 'text-xs sm:text-base md:text-lg' : 'text-xs sm:text-sm',
                'line-clamp-3 sm:line-clamp-none',
              ].join(' ')}
            >
              {item.summary}
            </p>
          ) : null}

          {/* 2 bullets max on mobile (keeps height sane) */}
          {bullets.length ? (
            <ul className="mt-3 sm:mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
              {bullets.map((f) => (
                <li
                  key={f}
                  className={[
                    'rounded-lg bg-white/8 text-white/85 ring-1 ring-white/12',
                    isCurrent ? 'px-3 py-2 text-[12px] sm:text-sm' : 'px-3 py-2 text-[12px] sm:text-[13px]',
                    'line-clamp-2',
                  ].join(' ')}
                >
                  {f}
                </li>
              ))}
            </ul>
          ) : null}

          {/* Quiet meta — hidden on mobile to reclaim space */}
          <div className="mt-3 sm:mt-4 hidden sm:flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-white/65">
            {shortTags.length ? (
              <div className="inline-flex items-center gap-2">
                <span className="opacity-70">Tags</span>
                <span className="text-white/75">{shortTags.join(' • ')}</span>
              </div>
            ) : null}

            {includes.length ? (
              <div className="inline-flex items-center gap-2">
                <span className="opacity-70">Includes</span>
                <span className="text-white/75">{includes.join(' • ')}</span>
              </div>
            ) : null}
          </div>

          {/* CTA */}
          <div className="mt-4 sm:mt-5 flex items-center justify-center gap-3">
            <div className="hidden sm:block text-xs text-white/55">
              Tap to view bundles • Or inquire directly
            </div>

            <Link
              href={`/contact?bundle=${encodeURIComponent(item.slug)}`}
              onClick={(e) => e.stopPropagation()}
              className={[
                'inline-flex items-center justify-center rounded-xl',
                'px-3.5 py-2 sm:px-4 sm:py-2.5',
                'bg-white text-black font-semibold ring-1 ring-white/30',
                'text-[13px] sm:text-sm md:text-base',
              ].join(' ')}
            >
              Ask about this bundle →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
