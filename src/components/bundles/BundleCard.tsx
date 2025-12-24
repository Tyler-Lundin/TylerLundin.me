"use client"
import { Bundle } from "@/services"
import { motion } from "framer-motion"
import BundleBackground from './BundleBackground'
import BundleTitle from './BundleTitle'
import BundlePrice from './BundlePrice'
import BundleSummary from './BundleSummary'
import CTAButton from './CTAButton'


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
  const baseCls = [
    'group absolute top-1/2  -translate-y-1/2 rounded-2xl overflow-hidden border shadow-2xl cursor-pointer select-none transition-all p-3 sm:p-4 md:p-6 lg:p-8 max-w-[80vw]',
    ''
  ].join(" ")

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
      style={{ zIndex: state === 'current' ? 3 : state === 'prev' ? 2 : 1 }}
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
      <BundleBackground bgImg={String(item.bgImg)} title={String(item.title)} isCurrent={isCurrent} />

      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-white dark:bg-black">
        <BundleTitle title={String(item.title)} />
        <BundlePrice priceText={String(priceText)} />
        <span className="absolute -z-10 inset-0 bg-gradient-to-b from-white dark:from-black via-white dark:via-black to-transparent h-24 top-2" />
      </div>

      <div className={ 'relative grid items-end  z-10 flex h-full flex-col p-2 sm:p-4 md:p-6 lg:p-8 '} >
        <div className="grid gap-2">
          <BundleSummary summary={item.summary} />
          <CTAButton slug={item.slug} href={ctaHref} label={ctaLabel} />
        </div>
      </div>

    </motion.div>
  )
}


// Note: Bullets component was extracted but isn't used here.
