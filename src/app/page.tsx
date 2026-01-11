import { Hero } from '@/components/sections/Hero';
import { ensureProfileOrRedirect } from '@/lib/profile';
import { loadProjectsFromFolders } from '@/lib/projects.server';
import { heroFolders } from '@/data/heroFolders';
import { projects as seededProjects } from '@/data/projects';
import ContactCTA from '@/components/sections/ContactCTA';
import Testimonials from '@/components/sections/Testimonials';
import ReactiveBackground from '@/components/ReactiveBackground';

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

  return (<>
    <div className="fixed inset-0 -z-10 opacity-60 ">
      <ReactiveBackground />
    </div>
    <main className="max-w-full overflow-x-hidden backdrop-blur-sm mx-2 md:mx-4 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit z-10 text-black dark:text-white ">
      <Hero projects={combined} />
      <ContactCTA />
      <Testimonials />
    </main>
  </>);
}
