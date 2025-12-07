import { promises as fs } from 'fs';
import path from 'path';
import type { Project, ProjectMedia } from '@/types/projects';
import { projects as seededProjects } from '@/data/projects';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PROJECTS_ROOT = path.join(PUBLIC_DIR, 'projects');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov']);

function toPublicPath(abs: string): string {
  return abs.replace(PUBLIC_DIR, '').replaceAll('\\', '/');
}

async function safeStat(p: string) {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

export async function listMediaInFolder(folderName: string): Promise<ProjectMedia[]> {
  const dir = path.join(PROJECTS_ROOT, folderName);
  const st = await safeStat(dir);
  if (!st || !st.isDirectory()) return [];

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile());

  const media: ProjectMedia[] = [];
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    const abs = path.join(dir, file.name);
    const pub = toPublicPath(abs);
    const baseIdFull = path.basename(file.name, ext);
    const variantMatch = baseIdFull.match(/^(.*?)-(dark|light)$/i);
    const baseId = variantMatch ? variantMatch[1] : baseIdFull;
    const variant = (variantMatch?.[2]?.toLowerCase() as 'dark' | 'light' | undefined) ?? undefined;

    if (IMAGE_EXT.has(ext)) {
      media.push({
        id: `${folderName}-${baseIdFull}`,
        type: 'image',
        src: pub,
        alt: baseId.replace(/[-_]/g, ' '),
        featured: media.length === 0,
        variant,
        baseKey: baseId,
        autoScroll: true,
        scrollDirection: 'vertical',
        scrollDurationMs: 16000,
      });
    } else if (VIDEO_EXT.has(ext)) {
      media.push({
        id: `${folderName}-${baseIdFull}`,
        type: 'video',
        src: pub,
        variant,
        baseKey: baseId,
        autoplay: true,
        loop: true,
        muted: true,
        playsInline: true,
        featured: media.length === 0,
      });
    }
  }

  return media;
}

export async function buildProjectFromFolder(folderName: string): Promise<Project | null> {
  const media = await listMediaInFolder(folderName);
  if (!media.length) return null;

  const title = folderName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const project: Project = {
    id: folderName,
    slug: folderName,
    title,
    description: `${title} showcase`,
    tech: [],
    links: undefined,
    media,
    heroShowcase: true,
  };

  return project;
}

export async function loadProjectsFromFolders(folders: string[]): Promise<Project[]> {
  const results = await Promise.all(folders.map(buildProjectFromFolder));
  return results.filter((p): p is Project => Boolean(p));
}

export async function listProjectFolders(): Promise<string[]> {
  const st = await safeStat(PROJECTS_ROOT);
  if (!st || !st.isDirectory()) return [];
  const entries = await fs.readdir(PROJECTS_ROOT, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const seeded = seededProjects.find((p) => p.slug === slug);
  if (seeded) return seeded;
  return await buildProjectFromFolder(slug);
}

export async function loadAllProjects(): Promise<Project[]> {
  const folders = await listProjectFolders();
  const dynamic = await Promise.all(folders.map(buildProjectFromFolder));
  const dyn = dynamic.filter((p): p is Project => Boolean(p));
  // Merge with seeded, prefer seeded when slugs collide
  const map = new Map<string, Project>();
  for (const p of dyn) map.set(p.slug, p);
  for (const p of seededProjects) map.set(p.slug, p);
  return Array.from(map.values());
}
