import { Projects } from '@/components/sections/Projects';
import { siteConfig } from '@/config/site';

export default function ProjectsPage() {
  const projectsSection = siteConfig.sections.find(
    (section) => section.type === 'projects'
  );

  if (!projectsSection || projectsSection.type !== 'projects') {
    return null;
  }

  return (
    <main className="pt-24  bg-gray-100/50 dark:bg-black/80 backdrop-blur-sm">
      <Projects section={projectsSection} />
    </main>
  );
} 