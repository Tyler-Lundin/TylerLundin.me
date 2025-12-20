import { siteConfig } from '@/config/site'
import { loadAllProjects } from '@/lib/projects.server'
import ProjectsIndex from '@/components/sections/ProjectsIndex'
import ContactCTA from '@/components/sections/ContactCTA'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'
import ProjectsBillboard from '@/components/billboard/ProjectsBillboard'

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
          <ProjectsBillboard
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
