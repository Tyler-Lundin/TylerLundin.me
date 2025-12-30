import Billboard from '@/components/billboard/Billboard'
import StickerParallax from '@/components/services/StickerParallax'
import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'

interface ContactBillboardProps {
  headline: string
  description: string
  themeKey?: BillboardThemeKey
}

export default function ContactBillboard({
  headline,
  description,
  themeKey = 'neon_arcade',
}: ContactBillboardProps) {
  const t = billboardThemes[themeKey]

  // Shared wrapper style for the sticker/message box
  const stickerContainerCls = "relative"
  const plateCls = `relative px-3 py-2 ${t.stickerPlate}`

  // --- Slots ---

  const Label = (
    <div className="inline-flex items-center gap-2">
      <span className="uppercase tracking-widest">Contact</span>
      <span className="h-1 w-1 rounded-full bg-white/70" />
      <span className="uppercase tracking-widest">Billboard</span>
    </div>
  )

  const Meta = (
    <div className="flex flex-wrap items-center gap-3">
      <div className={t.metaPill}>Reply in 1–2 business days</div>
      <div className="text-xs text-white/60 dark:text-neutral-400">
        Clear scope = faster quote
      </div>
    </div>
  )

  const RightContent = (
    <>
      {/* Desktop: Animated Sticker */}
      <div className={stickerContainerCls}>
        <div className={t.stickerGlow} />
        <div className={plateCls}>
          <StickerParallax sticker="thinking" size={4} />
        </div>
      </div>

      {/* Mobile: Fun Text (Hidden on desktop) */}
      <div className={`${stickerContainerCls} sm:hidden mt-4`}>
        <div className={t.stickerGlow} />
        <div className={plateCls}>
          <p className={`${t.title} text-sm leading-relaxed text-center`}>
            Send me a message, a hateful love letter, or a loving hate letter and I will get back to you!
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
    />
  )
}
