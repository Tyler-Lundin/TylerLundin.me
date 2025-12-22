"use client"
import { Bundle } from "@/services"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"


export default function BundleCard({
  item,
  state,
  onCardClick,
  ctaHref,
  ctaLabel,
}: {
  item: Bundle
  state: 'prev' | 'current' | 'next'
  onCardClick?: (item: Bundle, state: 'prev' | 'current' | 'next') => void
  ctaHref?: string
  ctaLabel?: string
}) {
  const baseCls =
    'group absolute top-1/2  -translate-y-1/2 rounded-2xl overflow-hidden border shadow-2xl cursor-pointer select-none transition-all p-4 sm:p-8'

  const layout: Record<typeof state, string> = {
    prev: 'left-0 -translate-x-5/6 aspect-[9/11] scale-80 -rotate-3',
    current: 'left-1/2 -translate-x-1/2 aspect-[9/11]',
    next: 'right-0 translate-x-5/6 aspect-[9/11] scale-80 rotate-3',
  }

  const isCurrent = state === 'current'
  const scale = isCurrent ? 1 : 0.94
  const opacity = isCurrent ? 1 : 1


  // Mobile-friendly caps: keep poster vibe without becoming a brochure
  const bullets = (item.features ?? []).slice(0, 2)
  const shortTags = (item.tags ?? []).slice(0, 2)
  const includes = (item.serviceSlugs ?? []).slice(0, 4)
  const priceText = item.priceRange
    ?? (item.prices && item.prices.length
      ? `$${item.prices[0].amount}/${item.prices[0].cadence === 'monthly' ? 'mo' : 'one-time'}`
      : undefined)

  return (
    <motion.div
      key={`${item.slug}-${state}`}
      className={[
        baseCls,
        layout[state],
        'h-full',
        isCurrent ? 'blur-[0px]' : 'blur-[1px] saturate-[0.8] brightness-[0.75]',
      ].join(' ')}
      style={{ zIndex: state === 'prev' ? 3 : state === 'current' ? 2 : 1 }}
      initial={false}
      animate={{ opacity, scale }}
      transition={{ type: 'spring', stiffness: 420, damping: 42, mass: 0.6 }}
      onClick={() => onCardClick?.(item, state)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onCardClick?.(item, state)
      }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {item.bgImg && (
          <Image
            src={item.bgImg}
            fill
            alt={`${item.title} bundle`}
            className={[
              'object-cover',
              'transition-opacity duration-200',
              item.className ?? '',
            ].join(' ')}
            priority={isCurrent}
          />
        )}

        {/* Cinematic overlays (mobile slightly darker for readability) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20 sm:from-black/80 sm:via-black/45 sm:to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,0.10),transparent_60%)]" />
        <div className="absolute inset-0 ring-1 ring-white/5" />
      </div>

      {/* Bottom content (poster-style) */}
      <div
        className={[
          'relative grid items-end  z-10 flex h-full flex-col p-2 sm:p-4 md:p-6 lg:p-8 ',
        ].join(' ')}
      >
        <div className="max-w-3xl">
          <h3
            className={[
              'font-extrabold tracking-tight text-white text-center',
              'text-xl sm:text-3xl md:text-4xl leading-[1.0]',
            ].join(' ')}
          >
            {item.title}
          </h3>

          {priceText ? (
            <div className="mt-2 flex items-center justify-center">
              <span className="inline-flex items-center rounded-xl bg-white text-black px-2.5 py-1 text-[11px] font-semibold ring-1 ring-white/30">
                {priceText}
              </span>
            </div>
          ) : null}

          {item.summary ? (
            <p
              className={[
                'text-xs sm:text-sm font-light pb-2 text-center',
                'line-clamp-3 sm:line-clamp-none',
              ].join(' ')}
            >
              {item.summary}
            </p>
          ) : null}

          <CTAButton slug={item.slug} href={ctaHref} label={ctaLabel} />

        </div>
      </div>
    </motion.div>
  )
}


const CTAButton = ({ slug, href, label }: { slug: string; href?: string; label?: string }) => {
  return (
    <div className="mx-auto w-fit">

      <Link
        href={href ?? `/bundle/${slug}`}
        onClick={(e) => e.stopPropagation()}
        className={[
          'inline-flex items-center justify-center rounded-xl whitespace-nowrap p-2',
          'bg-white text-black font-semibold ring-1 ring-white/30',
          'text-[13px] sm:text-sm md:text-base',
        ].join(' ')}
      >
        {label ?? 'View Bundle →'}
      </Link>
    </div>
  )
}


const Bullets = ({ bullets }: { bullets: string[] }) => {
  return (
    <ul className="mt-3 sm:mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
      {bullets.map((f) => (
        <li
          key={f}
          className={[
            'rounded-lg bg-white/8 text-white/85 ring-1 ring-white/12',
            'line-clamp-2',
          ].join(' ')}
        >
          {f}
        </li>
      ))}
    </ul>
  )
}
