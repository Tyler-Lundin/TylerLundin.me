import { siteConfig } from '@/config/site'
import { loadAllProjects } from '@/lib/projects.server'
import ProjectsIndex from '@/components/sections/ProjectsIndex'
import ContactCTA from '@/components/sections/ContactCTA'
import StickerTyler from '@/components/StickerTyler'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'
import { Sora } from "next/font/google";

const sora = Sora({ subsets: ["latin"], display: "swap" });

function ProjectsBillboardHeader({
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
              PROJECTS
              <span className="h-1 w-1 rounded-full bg-white/70" />
              BILLBOARD
            </div>

            <h1
              style={{...sora.style,}}
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
              <div className={t.metaPill}>Case studies and recent work</div>
              <div className="text-xs text-white/60 dark:text-neutral-400">
                Real projects for real businesses
              </div>
            </div>
          </div>

          <div className="shrink-0 flex justify-center sm:justify-end gap-2">
            <div className="relative">
              <div className={t.stickerGlow} />
              <div className={['relative px-3 py-2', t.stickerPlate].join(' ')}>
                <StickerTyler className="opacity-95" size={3} sticker="typing" />
              </div>
            </div>

            <div className="relative sm:hidden">
              <div className={t.stickerGlow} />
              <div className={['relative px-3 py-2 ', t.stickerPlate].join(' ')}>
                <h1> Hello World, I am Tyler </h1> 
              </div>
              <div className={['relative px-3 py-2 mt-2', t.stickerPlate].join(' ')}>
                <h1> Below are just a few of my recent projects. </h1> 
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  )
}

export default async function ProjectsPage() {
  const projectsSection = siteConfig.sections.find((s) => s.type === 'projects')
  const projects = await loadAllProjects()

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
          <ProjectsBillboardHeader
            headline={projectsSection?.headline ?? 'Projects'}
            description={projectsSection && 'subheadline' in projectsSection ? (projectsSection as any).subheadline : undefined}
            themeKey={themeKey}
          />
        </div>
      </section>

      <ProjectsIndex
        title={projectsSection?.headline ?? 'Projects'}
        subtitle={projectsSection && 'subheadline' in projectsSection ? (projectsSection as any).subheadline : undefined}
        projects={projects}
      />

      <ContactCTA />
    </main>
  )
}
