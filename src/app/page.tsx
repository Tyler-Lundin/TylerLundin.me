import { Hero } from '@/components/sections/Hero';
import { loadProjectsFromFolders } from '@/lib/projects.server';
import { heroFolders } from '@/data/heroFolders';
import { projects as seededProjects } from '@/data/projects';
import ContactCTA from '@/components/sections/ContactCTA';
import AutoScrollHeroSpotlights from '@/components/behavior/AutoScrollHeroSpotlights';
import Testimonials from '@/components/sections/Testimonials';

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
    <main className="max-w-full relative overflow-x-hidden mx-2 md:mx-4 bg-white/75 dark:bg-black/75 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit overflow-visible z-10 text-black dark:text-white ">
      <Hero projects={combined} />
      {/* Auto-scroll toward Hero spotlights on first visit until user cancels */}
      <AutoScrollHeroSpotlights />
      <ContactCTA />
      <Testimonials />
    </main>
  );
}
