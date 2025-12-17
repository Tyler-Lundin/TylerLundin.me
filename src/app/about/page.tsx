import AboutFlow from '@/components/sections/AboutFlow';
import { siteConfig } from '@/config/site';
import { loadAllProjects } from '@/lib/projects.server';

export default async function AboutPage() {
  const aboutSection = siteConfig.sections.find(
    (section) => section.type === 'about'
  );

  if (!aboutSection || aboutSection.type !== 'about') {
    return null;
  }

  const projects = await loadAllProjects();

  return (
    <main className="max-w-full overflow-x-hidden mx-2 md:mx-4 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit overflow-visible bg-gradient-to-b from-neutral-50 dark:from-black z-10 via-transparent to-white dark:to-black text-black dark:text-white ">
      <AboutFlow projects={projects} />
    </main>
  );
} 
