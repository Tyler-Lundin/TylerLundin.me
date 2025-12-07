"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { Project, ProjectMedia } from '@/types/projects';
import { MacbookFrame, IPhoneFrame, DeviceKind } from './DeviceFrames';

type Props = {
  project: Project;
};

function pickDevice(_media: ProjectMedia): DeviceKind {
  // Featured area should keep a standard rectangular aspect; use MacBook frame
  return 'macbook';
}

function MediaInFrame({ media, project }: { media: ProjectMedia; project: Project }) {
  const device = pickDevice(media);
  const isTallAuto = media.type === 'image' && (media.autoScroll ?? media.src.startsWith('/projects/')) && (media.scrollDirection ?? 'vertical') === 'vertical';
  const content = media.type === 'image' ? (
    isTallAuto ? (
      <img
        src={media.src}
        alt={media.alt ?? project.title}
        className="absolute left-0 top-0 w-full h-auto pan-vert"
        style={{
          ...(media.scrollDurationMs ? ({ ['--pan-duration' as any]: `${media.scrollDurationMs}ms` } as any) : {}),
          ...(isTallAuto ? ({ ['--pan-amount' as any]: '-60%' } as any) : {}),
        }}
      />
    ) : (
      <Image
        src={media.src}
        alt={media.alt ?? project.title}
        fill
        sizes="(min-width: 1280px) 900px, (min-width: 1024px) 800px, 100vw"
        className={[
          'object-cover',
          (media.autoScroll ?? media.src.startsWith('/projects/'))
            ? [media.scrollDirection === 'horizontal' ? 'pan-horz' : 'pan-vert', media.scrollDirection === 'horizontal' ? 'object-center' : 'object-top'].join(' ')
            : '',
        ].join(' ')}
        priority
        style={{
          ...(media.scrollDurationMs ? ({ ['--pan-duration' as any]: `${media.scrollDurationMs}ms` } as any) : {}),
        }}
      />
    )
  ) : (
    <video
      className="h-full w-full object-cover"
      autoPlay={media.autoplay ?? true}
      loop={media.loop ?? true}
      muted={media.muted ?? true}
      playsInline={media.playsInline ?? true}
      poster={media.poster}
      controls
    >
      <source src={media.src} />
    </video>
  );

  if (device === 'iphone') {
    return <IPhoneFrame fluid>{content}</IPhoneFrame>;
  }
  return <MacbookFrame fluid>{content}</MacbookFrame>;
}

export default function ProjectPresentation({ project }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const media = project.media;
  const active = useMemo(() => media[activeIndex] ?? media[0], [media, activeIndex]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Featured device showcase with thumbnails */}
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-3 sm:p-4 shadow-sm">
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9]">
            <MediaInFrame media={active} project={project} />
          </div>
        </div>

        {/* Thumbnails */}
        {media.length > 1 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {media.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setActiveIndex(i)}
                className={[
                  'group relative aspect-video rounded-lg overflow-hidden border transition',
                  i === activeIndex
                    ? 'border-black/40 dark:border-white/40'
                    : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30',
                ].join(' ')}
                aria-label={`View media ${i + 1}`}
              >
                {m.type === 'image' ? (
                  <Image
                    src={m.src}
                    alt=""
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center text-xs">Video</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Details */}
      <aside className="lg:col-span-5 xl:col-span-4 space-y-6">
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Project Details</h2>
          {project.description && (
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {project.description}
            </p>
          )}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {project.client && (
              <>
                <dt className="text-neutral-500 dark:text-neutral-400">Client</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">{project.client}</dd>
              </>
            )}
            {project.role && (
              <>
                <dt className="text-neutral-500 dark:text-neutral-400">Role</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">{project.role}</dd>
              </>
            )}
            {project.location && (
              <>
                <dt className="text-neutral-500 dark:text-neutral-400">Location</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">{project.location}</dd>
              </>
            )}
            {(project.startedAt || project.endedAt) && (
              <>
                <dt className="text-neutral-500 dark:text-neutral-400">Timeline</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {project.startedAt ?? '—'} → {project.endedAt ?? 'Present'}
                </dd>
              </>
            )}
          </dl>

          {project.tech?.length ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 text-xs text-neutral-700 dark:text-neutral-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {project.links?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm hover:opacity-90"
                >
                  {l.label ?? l.type}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {/* Features */}
        {project.features?.length ? (
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-5">
            <h3 className="text-sm font-medium mb-2">Features</h3>
            <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1 list-disc pl-5">
              {project.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Services & Integrations */}
        {(project.services?.length || project.integrations?.length) ? (
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-5 space-y-4">
            {project.services?.length ? (
              <div>
                <h3 className="text-sm font-medium mb-2">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {project.services.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 text-xs text-neutral-700 dark:text-neutral-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {project.integrations?.length ? (
              <div>
                <h3 className="text-sm font-medium mb-2">Integrations</h3>
                <div className="flex flex-wrap gap-2">
                  {project.integrations.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 text-xs text-neutral-700 dark:text-neutral-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Specs / Performance */}
        {project.specs && (
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-5">
            <h3 className="text-sm font-medium mb-3">Specs</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {project.specs.lighthouse && (
                <div>
                  <div className="text-xs uppercase text-neutral-500 dark:text-neutral-400 mb-1">Lighthouse</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(project.specs.lighthouse).map(([k, v]) => (
                      <span key={k} className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-black/10 dark:border-white/10">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {project.specs.pagespeed && (
                <div>
                  <div className="text-xs uppercase text-neutral-500 dark:text-neutral-400 mb-1">PageSpeed</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(project.specs.pagespeed).map(([k, v]) => (
                      <span key={k} className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-black/10 dark:border-white/10">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {project.specs.coreWebVitals && (
                <div className="col-span-2">
                  <div className="text-xs uppercase text-neutral-500 dark:text-neutral-400 mb-1">Core Web Vitals</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(project.specs.coreWebVitals).map(([k, v]) => (
                      <span key={k} className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-black/10 dark:border-white/10">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
