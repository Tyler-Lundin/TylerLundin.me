import Billboard from '@/components/billboard/Billboard'
import StickerParallax from '@/components/services/StickerParallax'
import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'], display: 'swap' })

interface QuoteBillboardProps {
  headline: string
  description?: string
  themeKey?: BillboardThemeKey
}

export default function QuoteBillboard({
  headline,
  description,
  themeKey = 'neon_arcade',
}: QuoteBillboardProps) {
  const t = billboardThemes[themeKey]

  // Shared container styles to avoid repetition
  const stickerContainerCls = "relative"
  const plateCls = `relative px-3 py-2 ${t.stickerPlate}`

  // --- Slots ---

  const Label = (
    <div className="inline-flex items-center gap-2">
      <span className="uppercase tracking-widest">Quote</span>
      <span className="h-1 w-1 rounded-full bg-white/70" />
      <span className="uppercase tracking-widest">Billboard</span>
    </div>
  )

  const Meta = (
    <div className="flex flex-wrap items-center gap-3">
      <div className={t.metaPill}>Scoped brief = faster quote</div>
      <div className="text-xs text-white/60 dark:text-neutral-400">
        Share goals, budget, and timeline
      </div>
    </div>
  )

  const RightContent = (
    <>
      {/* Desktop: Larger "Polite" Sticker */}
      <div className={stickerContainerCls}>
        <div className={t.stickerGlow} />
        <div className={plateCls}>
          <StickerParallax className="opacity-95" size={5} sticker="polite" />
        </div>
      </div>

      {/* Mobile: Value Proposition Text */}
      <div className={`${stickerContainerCls} sm:hidden mt-4`}>
        <div className={t.stickerGlow} />
        <div className={plateCls}>
          <p className={`${t.title} text-sm leading-relaxed text-center`}>
            Send me a quote and I will build a free Demo within 48 hours.
          </p>
        </div>
      </div>
    </>
  )

  return (
    <Billboard
      label={Label}
      headline={headline}
      description={description}
      themeKey={themeKey}
      meta={Meta}
      right={RightContent}
      titleStyle={sora.style}
    />
  )
}
