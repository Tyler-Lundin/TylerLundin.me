import Billboard from '@/components/billboard/Billboard'
import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'
import StickerTyler from '@/components/StickerTyler'
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
      <span className="h-1 w-1 rounded-full bg-white/70" />
      BILLBOARD
    </div>
  )
  const meta = (
    <>
      <div className={t.metaPill}>Case studies and recent work</div>
      <div className="text-xs text-white/60 dark:text-neutral-400">Real projects for real businesses</div>
    </>
  )
  const right = (
    <>
      <div className="relative">
        <div className={t.stickerGlow} />
        <div className={["relative px-3 py-2", t.stickerPlate].join(' ')}>
          <StickerTyler className="opacity-95" size={3} sticker="typing" />
        </div>
      </div>
      <div className="relative sm:hidden">
        <div className={t.stickerGlow} />
        <div className={["relative px-3 py-2 ", t.stickerPlate].join(' ')}>
          <h1 className={t.title}> Hello World, I am Tyler </h1>
        </div>
        <div className={["relative px-3 py-2 mt-2", t.stickerPlate].join(' ')}>
          <h1 className={t.title}> Below are just a few of my recent projects. </h1>
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
