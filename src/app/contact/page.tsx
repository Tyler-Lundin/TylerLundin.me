import { siteConfig } from '@/config/site'
import ContactSimpleForm from '@/components/sections/ContactSimpleForm'
import { Suspense } from 'react'
import ContactBillboard from '@/components/billboard/ContactBillboard'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'

export default function ContactPage() {
  const contactSection = siteConfig.sections.find((section) => section.type === 'contact')
  if (!contactSection || contactSection.type !== 'contact') return null

  // Use globally selected theme from root theme config
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
      <section className="relative p-4  sm:p-6">
        <ContactBillboard
          headline="Contact Tyler"
          description="Send a quick message. I’ll reply with the next step."
          themeKey={themeKey}
        />
        <div className="mt-8 sm:mt-10">
          <Suspense fallback={<div className="text-sm text-neutral-600 dark:text-neutral-300">Loading form…</div>}>
            <ContactSimpleForm />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
