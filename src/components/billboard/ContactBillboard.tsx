import Billboard from '@/components/billboard/Billboard'
import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'
import StickerParallax from '@/components/services/StickerParallax'

export default function ContactBillboard({
  headline,
  description,
  themeKey = 'neon_arcade',
}: {
  headline: string
  description: string
  themeKey?: BillboardThemeKey
}) {
  const t = billboardThemes[themeKey]
  const label = (
    <div className="inline-flex items-center gap-2">
      CONTACT
      <span className="h-1 w-1 rounded-full bg-white/70" />
      BILLBOARD
    </div>
  )
  const meta = (
    <>
      <div className={t.metaPill}>Reply in 1–2 business days</div>
      <div className="text-xs text-white/60 dark:text-neutral-400">Clear scope = faster quote</div>
    </>
  )
  const right = (
    <>
      <div className="relative">
        <div className={t.stickerGlow} />
        <div className={["relative px-3 py-2", t.stickerPlate].join(' ')}>
          <StickerParallax sticker="thinking" size={7} />
        </div>
      </div>
      <div className="relative sm:hidden">
        <div className={t.stickerGlow} />
        <div className={["relative px-3 py-2 ", t.stickerPlate].join(' ')}>
          <h1 className={t.title}> Send me a message, a hateful love letter, or a loving hate letter and I will get back to you! </h1>
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
    />
  )
}
