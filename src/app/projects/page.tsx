import { siteConfig } from '@/config/site';
import { loadAllProjects } from '@/lib/projects.server';
import ProjectsIndex from '@/components/sections/ProjectsIndex';
import ContactCTA from '@/components/sections/ContactCTA';

export default async function ProjectsPage() {
  const projectsSection = siteConfig.sections.find((s) => s.type === 'projects');
  const projects = await loadAllProjects();

  return (
    <main className="max-w-full overflow-x-hidden mx-2 md:mx-4 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit overflow-visible bg-gradient-to-b from-neutral-50 dark:from-black z-10 via-transparent to-white dark:to-black text-black dark:text-white ">
      <ProjectsIndex
        title={projectsSection?.headline ?? 'Projects'}
        subtitle={projectsSection && 'subheadline' in projectsSection ? (projectsSection as any).subheadline : undefined}
        projects={projects}
      />
        <ContactCTA />
    </main>
  );
}
