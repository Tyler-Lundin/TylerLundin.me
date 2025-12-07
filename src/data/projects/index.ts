import type { ProjectFull, ProjectSummary } from '@/types/projects';

// Import individual project configs here
import { zevlin } from './zevlin';

export const projectsFull: ProjectFull[] = [
  zevlin,
  // Add other projects as they are migrated
];

export const projectsBySlug = new Map<string, ProjectFull>(
  projectsFull.map((p) => [p.slug, p])
);

export const projectsSummary: ProjectSummary[] = projectsFull.map((p) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  tagline: p.tagline,
  description: p.description,
  client: p.client,
  role: p.role,
  location: p.location,
  tech: p.tech,
  tags: p.tags,
  links: p.links,
  cover: p.cover ?? (p.media?.find((m) => m.featured) ?? p.media?.[0]),
  media: p.media,
  weight: p.weight,
  status: p.status,
  isHighlight: p.isHighlight,
  hasCaseStudy: p.hasCaseStudy,
  startedAt: p.startedAt,
  endedAt: p.endedAt,
}));

