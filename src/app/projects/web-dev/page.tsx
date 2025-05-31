import { WebDevProjects } from '@/components/sections/WebDevProjects';
import { siteConfig } from '@/config/site';

export default function ProjectsPage() {
  const projectsSection = siteConfig.sections.find(
    (section) => section.type === 'projects/web-dev'
  );

  if (!projectsSection || projectsSection.type !== 'projects/web-dev') {
    return null;
  }

  return (
    <main className="pt-24  bg-gray-100/50 dark:bg-black/80 backdrop-blur-sm">
      <WebDevProjects section={projectsSection} />
    </main>
  );
} 