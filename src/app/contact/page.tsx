import { siteConfig } from '@/config/site'
import ContactSimpleForm from '@/components/sections/ContactSimpleForm'
import { Suspense } from 'react'
import StickerTyler from '@/components/StickerTyler'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'
import StickerParallax from '@/components/services/StickerParallax'

type BillboardThemeKey =
  | 'neon_arcade'
  | 'noir_poster'
  | 'industrial_hazard'
  | 'holo_glass'
  | 'crt_terminal'
  | 'desert_highway'

const BILLBOARD_THEMES: Record<
  BillboardThemeKey,
  {
    wrap: string
    panel: string
    overlay: string
    label: string
    title: string
    desc: string
    stickerPlate: string
    stickerGlow: string
    metaPill: string
  }
> = {
  neon_arcade: {
    wrap: 'bg-gradient-to-b from-neutral-50 dark:from-black via-transparent to-white dark:to-black',
    panel:
      'rounded-2xl overflow-hidden border shadow-[0_24px_90px_rgba(0,0,0,0.30)] ' +
      'bg-black/80 dark:bg-black/75 border-white/10',
    overlay:
      'pointer-events-none absolute inset-0 ' +
      'bg-[radial-gradient(900px_circle_at_25%_15%,rgba(56,189,248,0.35),transparent_55%),radial-gradient(700px_circle_at_85%_30%,rgba(168,85,247,0.30),transparent_60%)] ' +
      'after:content-[""] after:absolute after:inset-0 after:opacity-[0.10] after:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.0)_0px,rgba(255,255,255,0.0)_6px,rgba(255,255,255,0.55)_7px)] after:[background-size:100%_7px]',
    label:
      'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase ' +
      'bg-white/10 text-white ring-1 ring-cyan-300/30',
    title: 'text-white',
    desc: 'text-white/80',
    stickerPlate:
      'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_14px_60px_rgba(0,0,0,0.40)]',
    stickerGlow:
      'absolute -inset-4 rounded-2xl bg-[radial-gradient(120px_circle_at_30%_30%,rgba(34,211,238,0.35),transparent_60%),radial-gradient(140px_circle_at_70%_60%,rgba(168,85,247,0.30),transparent_60%)] blur-[2px]',
    metaPill:
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ' +
      'bg-white text-black',
  },

  noir_poster: {
    wrap: 'bg-gradient-to-b from-neutral-50 dark:from-black via-transparent to-white dark:to-black',
    panel:
      'rounded-2xl overflow-hidden border shadow-[0_24px_90px_rgba(0,0,0,0.18)] ' +
      'bg-white/85 dark:bg-black/55 border-black/10 dark:border-white/10 backdrop-blur-md',
    overlay:
      'pointer-events-none absolute inset-0 ' +
      'bg-[radial-gradient(900px_circle_at_20%_15%,rgba(0,0,0,0.10),transparent_60%)] ' +
      'after:content-[""] after:absolute after:inset-0 after:opacity-[0.10] after:bg-[radial-gradient(2px_2px_at_1px_1px,rgba(0,0,0,0.35),transparent_40%)] after:[background-size:6px_6px] dark:after:opacity-[0.10] dark:after:bg-[radial-gradient(2px_2px_at_1px_1px,rgba(255,255,255,0.25),transparent_40%)]',
    label:
      'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase ' +
      'bg-black/85 text-white dark:bg-white/90 dark:text-black',
    title: 'text-neutral-950 dark:text-neutral-50',
    desc: 'text-slate-700 dark:text-neutral-300',
    stickerPlate:
      'rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/25 shadow-[0_12px_40px_rgba(0,0,0,0.14)]',
    stickerGlow:
      'absolute -inset-4 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] blur-[2px]',
    metaPill:
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ' +
      'bg-neutral-950 text-white dark:bg-white dark:text-black',
  },

  industrial_hazard: {
    wrap: 'bg-gradient-to-b from-neutral-50 dark:from-black via-transparent to-white dark:to-black',
    panel:
      'rounded-2xl overflow-hidden border shadow-[0_24px_90px_rgba(0,0,0,0.22)] ' +
      'bg-neutral-900/90 border-white/10',
    overlay:
      'pointer-events-none absolute inset-0 ' +
      'bg-[linear-gradient(135deg,rgba(250,204,21,0.18)_0%,transparent_35%,transparent_65%,rgba(250,204,21,0.10)_100%)] ' +
      'after:content-[""] after:absolute after:inset-x-0 after:top-0 after:h-2 after:bg-[repeating-linear-gradient(45deg,rgba(250,204,21,0.75)_0px,rgba(250,204,21,0.75)_10px,rgba(0,0,0,0.75)_10px,rgba(0,0,0,0.75)_20px)]',
    label:
      'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase ' +
      'bg-yellow-300 text-black',
    title: 'text-white',
    desc: 'text-white/80',
    stickerPlate:
      'rounded-2xl border border-white/10 bg-white/5 shadow-[0_14px_60px_rgba(0,0,0,0.35)]',
    stickerGlow:
      'absolute -inset-4 rounded-2xl bg-[radial-gradient(160px_circle_at_40%_40%,rgba(250,204,21,0.20),transparent_60%)] blur-[2px]',
    metaPill:
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-yellow-300 text-black',
  },

  holo_glass: {
    wrap: 'bg-gradient-to-b from-neutral-50 dark:from-black via-transparent to-white dark:to-black',
    panel:
      'rounded-2xl overflow-hidden border shadow-[0_24px_90px_rgba(0,0,0,0.16)] ' +
      'bg-white/55 dark:bg-white/5 border-black/10 dark:border-white/12 backdrop-blur-xl',
    overlay:
      'pointer-events-none absolute inset-0 ' +
      'bg-[radial-gradient(900px_circle_at_20%_10%,rgba(59,130,246,0.20),transparent_60%),radial-gradient(800px_circle_at_85%_25%,rgba(16,185,129,0.16),transparent_60%)] ' +
      'after:content-[""] after:absolute after:inset-0 after:opacity-[0.22] after:bg-[linear-gradient(120deg,rgba(255,255,255,0.25),transparent_35%,transparent_65%,rgba(255,255,255,0.18))]',
    label:
      'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase ' +
      'bg-black/80 text-white dark:bg-white/90 dark:text-black',
    title: 'text-neutral-950 dark:text-neutral-50',
    desc: 'text-slate-700 dark:text-neutral-300',
    stickerPlate:
      'rounded-2xl border border-black/10 dark:border-white/12 bg-white/55 dark:bg-black/25 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)]',
    stickerGlow:
      'absolute -inset-4 rounded-2xl bg-[radial-gradient(140px_circle_at_40%_30%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(160px_circle_at_70%_70%,rgba(16,185,129,0.14),transparent_60%)] blur-[2px]',
    metaPill:
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-neutral-950 text-white dark:bg-white dark:text-black',
  },

  crt_terminal: {
    wrap: 'bg-gradient-to-b from-neutral-50 dark:from-black via-transparent to-white dark:to-black',
    panel:
      'rounded-2xl overflow-hidden border shadow-[0_24px_90px_rgba(0,0,0,0.26)] ' +
      'bg-black/85 border-emerald-300/20',
    overlay:
      'pointer-events-none absolute inset-0 ' +
      'bg-[radial-gradient(900px_circle_at_30%_15%,rgba(16,185,129,0.18),transparent_60%)] ' +
      'after:content-[""] after:absolute after:inset-0 after:opacity-[0.14] after:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.0)_0px,rgba(255,255,255,0.0)_5px,rgba(16,185,129,0.45)_6px)] after:[background-size:100%_6px]',
    label:
      'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase ' +
      'bg-emerald-300/15 text-emerald-200 ring-1 ring-emerald-300/25',
    title: 'text-emerald-100',
    desc: 'text-emerald-100/70',
    stickerPlate:
      'rounded-2xl border border-emerald-300/20 bg-emerald-300/10 shadow-[0_14px_60px_rgba(0,0,0,0.35)]',
    stickerGlow:
      'absolute -inset-4 rounded-2xl bg-[radial-gradient(160px_circle_at_45%_45%,rgba(16,185,129,0.18),transparent_60%)] blur-[2px]',
    metaPill:
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-emerald-300 text-black',
  },

  desert_highway: {
    wrap: 'bg-gradient-to-b from-neutral-50 dark:from-black via-transparent to-white dark:to-black',
    panel:
      'rounded-2xl overflow-hidden border shadow-[0_24px_90px_rgba(0,0,0,0.18)] ' +
      'bg-white/80 dark:bg-black/55 border-black/10 dark:border-white/10 backdrop-blur-md',
    overlay:
      'pointer-events-none absolute inset-0 ' +
      'bg-[radial-gradient(900px_circle_at_20%_15%,rgba(251,191,36,0.20),transparent_60%),radial-gradient(800px_circle_at_80%_20%,rgba(244,63,94,0.10),transparent_60%)] ' +
      'after:content-[""] after:absolute after:inset-0 after:opacity-[0.10] after:bg-[radial-gradient(2px_2px_at_1px_1px,rgba(0,0,0,0.35),transparent_40%)] after:[background-size:7px_7px] dark:after:bg-[radial-gradient(2px_2px_at_1px_1px,rgba(255,255,255,0.25),transparent_40%)]',
    label:
      'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase ' +
      'bg-black/85 text-white dark:bg-white/90 dark:text-black',
    title: 'text-neutral-950 dark:text-neutral-50',
    desc: 'text-slate-700 dark:text-neutral-300',
    stickerPlate:
      'rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/25 shadow-[0_12px_40px_rgba(0,0,0,0.14)]',
    stickerGlow:
      'absolute -inset-4 rounded-2xl bg-[radial-gradient(160px_circle_at_40%_40%,rgba(251,191,36,0.16),transparent_60%)] blur-[2px]',
    metaPill:
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-neutral-950 text-white dark:bg-white dark:text-black',
  },
}

function ContactBillboardHeader({
  headline,
  description,
  themeKey = 'neon_arcade',
}: {
  headline: string
  description: string
  themeKey?: BillboardThemeKeyFromConfig
}) {
  const t = billboardThemes[themeKey]

  return (
    <header className={['relative', t.panel].join(' ')}>
      <div className={t.overlay} />

      <div className="relative p-5 sm:p-7">
        {/* mobile-first stack, then desktop side-by-side */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="min-w-0">
            <div className={t.label}>
              CONTACT
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

            <p className={['mt-3 text-base sm:text-lg max-w-prose', t.desc].join(' ')}>
              {description}
            </p>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className={t.metaPill}>Reply in 1–2 business days</div>
              <div className="text-xs text-white/60 dark:text-neutral-400">
                Clear scope = faster quote
              </div>
            </div>
          </div>



          <div className="shrink-0 flex justify-start sm:justify-end gap-2">
            <div className="relative">
              <div className={t.stickerGlow} />
              <div className={['relative px-3 py-2', t.stickerPlate].join(' ')}>
                <StickerParallax sticker="thinking" size={7} />
              </div>
            </div>

            <div className="relative sm:hidden">
              <div className={t.stickerGlow} />
              <div className={['relative px-3 py-2 ', t.stickerPlate].join(' ')}>
                <h1> Send me a message, a hateful love letter, or a loving hate letter and I will get back to you! </h1>
              </div>
            </div>
          </div>



        </div>
      </div>
    </header>
  )
}

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
      <section className="relative py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ContactBillboardHeader
            headline={contactSection.headline}
            description={contactSection.description}
            themeKey={themeKey}
          />

          <div className="mt-8 sm:mt-10">
            <Suspense fallback={<div className="text-sm text-neutral-600 dark:text-neutral-300">Loading form…</div>}>
              <ContactSimpleForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  )
}
