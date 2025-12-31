import Billboard from '@/components/billboard/Billboard'
import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'
import Link from 'next/link'
import StickerParallax from '@/components/services/StickerParallax'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'] })

export default function ServicesBillboard({
  headline = 'Services',
  description = 'Hosting, design, logos, dashboards, and auth—wired together so your site runs fast, looks sharp, and stays online.',
  themeKey = 'neon_arcade',
  contactHref = '/contact',
  faqHref = '/services/faq',
}: {
  headline?: string
  description?: string
  themeKey?: BillboardThemeKey
  contactHref?: string
  faqHref?: string
}) {
  const t = billboardThemes[themeKey]

  const label = (
    <div className="inline-flex items-center gap-2">
      SERVICES
      <span className="h-1 w-1 rounded-full bg-white/70" />
      BILLBOARD
    </div>
  )

  const actions = (
    <>
      <Link
        href={contactHref}
        className={[
          'inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold',
          'bg-neutral-950 text-white dark:bg-white dark:text-black',
        ].join(' ')}
      >
        Contact me
        <span aria-hidden className="ml-1">→</span>
      </Link>
      <Link
        href={faqHref}
        className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold border border-black/10 dark:border-white/10"
      >
        FAQ & Pricing
      </Link>
    </>
  )


  return (
    <Billboard
      label={label}
      headline={headline}
      description={description}
      themeKey={themeKey}
      titleClassName={sora.className}
      actions={actions}
    />
  )
}
