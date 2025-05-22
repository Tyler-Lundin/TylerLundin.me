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
    <main className="min-h-screen bg-white dark:bg-black pt-12">
      <Projects section={projectsSection} />
    </main>
  );
} 