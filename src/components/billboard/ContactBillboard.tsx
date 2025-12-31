import Billboard from '@/components/billboard/Billboard'
import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'] })

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

  // --- Slots ---

  const Label = (
    <div className="inline-flex items-center gap-2">
      <span className="uppercase tracking-widest">Contact</span>
      <span className="h-1 w-1 rounded-full bg-white/70 dark:bg-black/70" />
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

  return (
    <Billboard
      label={Label}
      headline={headline}
      description={description}
      themeKey={themeKey}
      titleClassName={sora.className}
      meta={Meta}
    />
  )
}
