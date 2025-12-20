import Billboard from '@/components/billboard/Billboard'
import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'
import StickerParallax from '@/components/services/StickerParallax'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'], display: 'swap' })

export default function QuoteBillboard({
  headline,
  description,
  themeKey = 'neon_arcade',
}: {
  headline: string
  description?: string
  themeKey?: BillboardThemeKey
}) {
  const t = billboardThemes[themeKey]
  const label = (
    <div className="inline-flex items-center gap-2">
      QUOTE
      <span className="h-1 w-1 rounded-full bg-white/70" />
      BILLBOARD
    </div>
  )
  const meta = (
    <>
      <div className={t.metaPill}>Scoped brief = faster quote</div>
      <div className="text-xs text-white/60 dark:text-neutral-400">Share goals, budget, and timeline</div>
    </>
  )
  const right = (
    <>
      <div className="relative">
        <div className={t.stickerGlow} />
        <div className={["relative px-3 py-2", t.stickerPlate].join(' ')}>
          <StickerParallax className="opacity-95" size={5} sticker="polite" />
        </div>
      </div>
      <div className="relative sm:hidden">
        <div className={t.stickerGlow} />
        <div className={["relative px-3 py-2 ", t.stickerPlate].join(' ')}>
          <h1 className={t.title}> Send me a quote and I will build a free Demo within 48 hours. </h1>
        </div>
      </div>
    </>
  )

  return (
    <Billboard
      label={label}
      headline={headline}
      description={description}
      themeKey={themeKey}
      meta={meta}
      right={right}
      titleStyle={{ ...sora.style }}
    />
  )
}
