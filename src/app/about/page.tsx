import ReactiveBackground from '@/components/ReactiveBackground';
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
    <main className="max-w-full relative overflow-x-hidden mx-2 md:mx-4 bg-white/75 dark:bg-black/75 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit z-10 text-black dark:text-white ">
      <div className="fixed inset-0 -z-10 opacity-60 ">
        <ReactiveBackground />
      </div>
      <AboutFlow projects={projects} />
    </main>
  );
} 
