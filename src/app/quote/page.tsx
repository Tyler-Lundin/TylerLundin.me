import { siteConfig } from '@/config/site'
import QuoteWizard from '@/components/sections/QuoteWizard'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'
import QuoteBillboard from '@/components/billboard/QuoteBillboard'

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
          <QuoteBillboard
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
