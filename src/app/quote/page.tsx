import { siteConfig } from '@/config/site'
import StickerTyler from '@/components/StickerTyler'
import QuoteWizard from '@/components/sections/QuoteWizard'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'

function QuoteBillboardHeader({
  headline,
  description,
  themeKey = 'neon_arcade',
}: {
  headline: string
  description?: string
  themeKey?: BillboardThemeKeyFromConfig
}) {
  const t = billboardThemes[themeKey]

  return (
    <header className={['relative', t.panel].join(' ')}>
      <div className={t.overlay} />

      <div className="relative p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="min-w-0">
            <div className={t.label}>
              QUOTE
              <span className="h-1 w-1 rounded-full bg-white/70" />
              BILLBOARD
            </div>

            <h1
              className={[
                'mt-3 font-black tracking-tight leading-[1.02]',
                'text-3xl sm:text-5xl',
                t.title,
              ].join(' ')}
            >
              {headline}
            </h1>

            {description && (
              <p className={['mt-3 text-base sm:text-lg max-w-prose', t.desc].join(' ')}>
                {description}
              </p>
            )}

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className={t.metaPill}>Scoped brief = faster quote</div>
              <div className="text-xs text-white/60 dark:text-neutral-400">
                Share goals, budget, and timeline
              </div>
            </div>
          </div>

          <div className="shrink-0 flex justify-center sm:justify-end">
            <div className="relative">
              <div className={t.stickerGlow} />
              <div className={['relative px-3 py-2', t.stickerPlate].join(' ')}>
                <StickerTyler className="opacity-95" size={3} sticker="waving" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function QuotePage() {
  const section = siteConfig.sections.find((s) => s.type === 'quote')
  if (!section || section.type !== 'quote') return null

  const themeKey: BillboardThemeKeyFromConfig = themeConfig.billboard.themeKey

  return (
    <main
      className={[
        'max-w-full overflow-x-hidden mx-2 md:mx-4 my-4 rounded-2xl',
        'border border-black/10 dark:border-white/10',
        billboardThemes[themeKey].wrap,
        'text-black dark:text-white',
      ].join(' ')}
    >
      <section className="relative py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <QuoteBillboardHeader
            headline="Request a Quote"
            description={section.description}
            themeKey={themeKey}
          />

          <div className="mt-8 sm:mt-10">
            <QuoteWizard />
          </div>
        </div>
      </section>
    </main>
  )
}
