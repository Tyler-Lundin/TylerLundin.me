"use client"

import { Bundle } from "@/services"
import { motion } from "framer-motion"
import { sora } from '@/styles/fonts'
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
  const isCurrent = state === 'current'
  
  // Layout definitions
  const layout: Record<typeof state, string> = {
    prev: 'left-0 -translate-x-1/2 scale-90 -rotate-3 z-10 brightness-[0.6] blur-[1px]',
    current: 'left-1/2 -translate-x-1/2 z-30 brightness-100 blur-0',
    next: 'right-0 translate-x-1/2 scale-90 rotate-3 z-20 brightness-[0.6] blur-[1px]',
  }

  // Formatting Price
  const priceText = item.priceRange
    ?? (item.prices && item.prices.length
      ? `$${item.prices[0].amount}/${item.prices[0].cadence === 'monthly' ? 'mo' : 'one-time'}`
      : undefined)

  return (
    <motion.div
      key={`${item.slug}-${state}`}
      className={[
        'group absolute top-1/2 -translate-y-1/2 rounded-2xl overflow-hidden',
        'border border-white/10 shadow-2xl cursor-pointer select-none',
        'aspect-[9/11] h-full max-w-[90vw]',
        layout[state],
        sora.className,
      ].join(' ')}
      initial={false}
      animate={{ 
        scale: isCurrent ? 1 : 0.94,
        opacity: 1
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 0.8 }}
      onClick={() => onCardClick?.(item, state)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onCardClick?.(item, state)
      }}
    >
      {/* --- LAYER 1: Background --- */}
      <BundleBackground 
        bgImg={item.bgImg || ''} 
        title={item.title || ''} 
        isCurrent={isCurrent} 
      />

      {/* --- LAYER 2: Scrims (Gradient Overlays) --- */}
      {/* Top Gradient for Title visibility (light: white, dark: black) */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b 
                      from-black/80 via-black/40 to-transparent pointer-events-none" />
      {/* Bottom Gradient for Content visibility (light: white, dark: black) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t 
                      from-black/90 via-black/60 to-transparent pointer-events-none" />

      {/* --- LAYER 3: Content Grid --- */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6 lg:p-8">
        
        {/* Top Section: Title & Price */}
        <div className="flex justify-between items-start gap-4">
          <BundleTitle title={item.title || ''} />
          {priceText && <BundlePrice priceText={priceText} />}
        </div>

        {/* Bottom Section: Summary & Action */}
        <div className="flex flex-col gap-4">
          <BundleSummary summary={item.summary} />
          
          {/* Stop Propagation to prevent card click when clicking button */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            onKeyDown={(e) => e.stopPropagation()}
          >
            <CTAButton slug={item.slug} href={ctaHref} label={ctaLabel} />
          </div>
        </div>

      </div>
      
      {/* Optional: Hover border highlight */}
      <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/10 transition-colors rounded-2xl pointer-events-none" />
    </motion.div>
  )
}
