import { siteConfig } from '@/config/site'
import { loadAllProjects } from '@/lib/projects.server'
import ProjectsIndex from '@/components/sections/ProjectsIndex'
import ContactCTA from '@/components/sections/ContactCTA'
import { themeConfig, billboardThemes } from '@/config/theme'
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard'
import ProjectsBillboard from '@/components/billboard/ProjectsBillboard'
import ReactiveBackground from '@/components/ReactiveBackground'

export default async function ProjectsPage() {
  const projectsSection = siteConfig.sections.find((s) => s.type === 'projects')
  const projects = await loadAllProjects()

  const themeKey: BillboardThemeKeyFromConfig = themeConfig.billboard.themeKey

  return (
    <main
      className={[
        'max-w-full overflow-x-hidden mx-2 md:mx-4 my-4 rounded-2xl',
        'border border-black/10 dark:border-white/10',
        'p-2 sm:p-3 md:p-4 lg:p-8',
        'bg-white/50 dark:bg-black/50',
        billboardThemes[themeKey].wrap,
        'text-black dark:text-white',
      ].join(' ')}
    >

      <div className="fixed inset-0 -z-10 opacity-60 ">
      <ReactiveBackground />
      </div>
      <ProjectsBillboard
        headline={"My Projects"}
        description={projectsSection && 'subheadline' in projectsSection ? (projectsSection as any).subheadline : undefined}
        themeKey={themeKey}
      />

      <ProjectsIndex
        title={projectsSection?.headline ?? 'Projects'}
        subtitle={projectsSection && 'subheadline' in projectsSection ? (projectsSection as any).subheadline : undefined}
        projects={projects}
      />

      <ContactCTA />
    </main>
  )
}
