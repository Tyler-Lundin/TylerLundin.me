import Billboard from '@/components/billboard/Billboard'
import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'
import StickerParallax from '@/components/services/StickerParallax'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'] })

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
    <div className="text-xs text-black dark:text-white/60 ">Fresh posts, projects, and notes</div>
  )

  return (
    <Billboard
      label={label}
      headline={headline}
      description={description}
      themeKey={themeKey}
      titleClassName={sora.className}
      meta={meta}
    />
  )
}
