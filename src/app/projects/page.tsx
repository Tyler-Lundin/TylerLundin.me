import { siteConfig } from '@/config/site';
import { loadAllProjects } from '@/lib/projects.server';
import ProjectsIndex from '@/components/sections/ProjectsIndex';

export default async function ProjectsPage() {
  const projectsSection = siteConfig.sections.find((s) => s.type === 'projects');
  const projects = await loadAllProjects();

  return (
    <main className="pt-24 bg-gray-100/50 dark:bg-black/80 backdrop-blur-sm">
      <ProjectsIndex
        title={projectsSection?.headline ?? 'Projects'}
        subtitle={projectsSection && 'subheadline' in projectsSection ? (projectsSection as any).subheadline : undefined}
        projects={projects}
      />
    </main>
  );
}
