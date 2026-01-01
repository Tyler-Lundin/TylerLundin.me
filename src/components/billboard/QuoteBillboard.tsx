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

  // --- Slots ---

  const Label = (
    <div className="inline-flex items-center gap-2">
      <span className="uppercase tracking-widest">Quote</span>
      <span className="h-1 w-1 rounded-full bg-black" />
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

  return (
    <Billboard
      label={Label}
      headline={headline}
      description={description}
      themeKey={themeKey}
      meta={Meta}
      titleStyle={sora.style}
    />
  )
}
