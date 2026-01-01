import Billboard from '@/components/billboard/Billboard'
import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'], display: 'swap' })

export default function ProjectsBillboard({
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
      PROJECTS
      <span className="h-1 w-1 rounded-full bg-black" />
      BILLBOARD
    </div>
  )
  const meta = (
    <>
      <div className={t.metaPill}>Case studies and recent work</div>
      <div className="text-xs text-white/60 dark:text-neutral-400">Real projects for real businesses</div>
    </>
  )

  return (
    <Billboard
      label={label}
      headline={headline}
      description={description}
      themeKey={themeKey}
      meta={meta}
      titleStyle={{ ...sora.style }}
    />
  )
}
