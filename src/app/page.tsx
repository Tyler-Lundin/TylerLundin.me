import { Hero } from '@/components/sections/Hero';
import { loadProjectsFromFolders } from '@/lib/projects.server';
import { heroFolders } from '@/data/heroFolders';
import { projects as seededProjects } from '@/data/projects';
import ContactCTA from '@/components/sections/ContactCTA';

export default async function LandingPage() {
  // Load media from public/projects/<folder>/ for the hero showcase
  const dynamicProjects = await loadProjectsFromFolders(heroFolders);

  // Merge seeded with dynamic (dynamic overrides by slug)
  const bySlug = new Map<string, typeof seededProjects[number]>();
  for (const p of seededProjects) bySlug.set(p.slug, p);
  for (const p of dynamicProjects) bySlug.set(p.slug, { ...bySlug.get(p.slug), ...p });
  const combined = Array.from(bySlug.values())
    .filter((p) => p.heroShowcase)
    .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));

  return (
    <main className=" py-32 min-h-screen overflow-visible bg-gradient-to-b from-neutral-50 dark:from-black z-10 via-transparent to-neutral-100 dark:to-neutral-950 text-black dark:text-white grid ">
      <Hero projects={combined} />
      <ContactCTA />
    </main>
  );
}
