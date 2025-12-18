import { notFound } from 'next/navigation';
import { getProjectBySlug, loadAllProjects } from '@/lib/projects.server';
import Link from 'next/link';
import Image from 'next/image';
import ProjectPresentation from '@/components/presentation/ProjectPresentation';

// Next.js 15 types `params` as a Promise in app routes
type PageProps = { params: Promise<{ slug: string }> };

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return notFound();
  const all = await loadAllProjects();
  const others = all
    .filter((p) => p.slug !== slug)
    .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
    .slice(0, 6);

  return (
    <main className="max-w-full overflow-x-hidden mx-2 md:mx-4 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit overflow-visible bg-gradient-to-b from-neutral-50 dark:from-black z-10 via-transparent to-white dark:to-black text-black dark:text-white ">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{project.title}</h1>
          {project.tagline && (
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">{project.tagline}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {project.links?.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm hover:opacity-90"
              >
                {l.label ?? l.type}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            ))}
          </div>
        </header>
        <ProjectPresentation project={project} />

        {others.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-xl font-semibold">More Projects</h2>
              <Link href="/projects" className="text-sm text-neutral-700 dark:text-neutral-300 hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.map((p) => {
                const img = p.media.find((m) => m.type === 'image');
                return (
                  <Link key={p.slug} href={`/project/${p.slug}`} className="group relative rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5">
                    <div className="relative w-full aspect-[16/10]">
                      {img ? (
                        <Image src={img.src} alt={img.alt ?? p.title} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold">{p.title}</h3>
                      {p.tagline && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">{p.tagline}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
