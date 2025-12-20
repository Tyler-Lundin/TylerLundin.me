import Billboard from '@/components/billboard/Billboard'
import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'
import StickerParallax from '@/components/services/StickerParallax'

export default function BlogBillboard({
  headline = 'Blog',
  description = 'Long-form notes on code, training, and life.',
  themeKey = 'neon_arcade',
}: {
  headline?: string
  description?: string
  themeKey?: BillboardThemeKey
}) {
  const t = billboardThemes[themeKey]

  const label = (
    <div className="inline-flex items-center gap-2">
      BLOG
      <span className="h-1 w-1 rounded-full bg-white/70" />
      BILLBOARD
    </div>
  )

  const meta = (
    <div className="text-xs text-white/60 dark:text-neutral-400">Fresh posts, projects, and notes</div>
  )

  const right = (
    <>
      <div className="relative">
        <div className={t.stickerGlow} />
        <div className={["relative px-3 py-2", t.stickerPlate].join(' ')}>
          <StickerParallax className="opacity-95" size={3} sticker="typing" />
        </div>
      </div>
      <div className="relative sm:hidden">
        <div className={t.stickerGlow} />
        <div className={["relative px-3 py-2 ", t.stickerPlate].join(' ')}>
          <h1 className={t.title}> New ideas, shipped often. </h1>
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
