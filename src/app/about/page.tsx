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
    <main className="py-32 bg-gradient-to-b from-neutral-50 dark:from-black via-transparent to-neutral-100 dark:to-neutral-950">
      <AboutFlow projects={projects} />
    </main>
  );
} 
