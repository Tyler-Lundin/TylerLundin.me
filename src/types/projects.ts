// Project schema for portfolio content

export type MediaType = 'image' | 'video';

export interface BaseMedia {
  id: string;
  type: MediaType;
  src: string; // path under /public or remote URL
  alt?: string;
  /** Optional caption shown under media */
  caption?: string;
  /** Marks media as preferred for hero usage */
  featured?: boolean;
  /** Optional theme variant parsed from filename: "-dark" or "-light" */
  variant?: 'dark' | 'light';
  /** Base key to group light/dark variants of the same asset */
  baseKey?: string;
}

export interface ImageMedia extends BaseMedia {
  type: 'image';
  width?: number;
  height?: number;
  /** Enable slow auto-scroll/pan for tall screenshots */
  autoScroll?: boolean;
  /** Direction for auto scroll; defaults to vertical */
  scrollDirection?: 'vertical' | 'horizontal';
  /** Duration in ms for a full scroll cycle */
  scrollDurationMs?: number;
}

export interface VideoMedia extends BaseMedia {
  type: 'video';
  /** Optional poster image path for video */
  poster?: string;
  /** Default playback hints for showcase usage */
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

export type ProjectMedia = ImageMedia | VideoMedia;

export interface ProjectLink {
  type: 'live' | 'repo' | 'case-study' | 'design' | 'docs' | 'github';
  url: string;
  label?: string;
}

export interface Project {
  id: string; // stable ID
  slug: string; // URL-friendly identifier
  title: string;
  tagline?: string;
  description: string;
  client?: string;
  role?: string;
  location?: string;
  /** e.g., ['Next.js', 'TypeScript', 'Tailwind'] */
  tech: string[];
  tags?: string[];
  /** Notable features delivered */
  features?: string[];
  /** Services provided (e.g., Design, Dev, SEO) */
  services?: string[];
  /** Third-party tools/APIs integrated */
  integrations?: string[];
  /** Optional performance/specs snapshot */
  specs?: {
    lighthouse?: Partial<Record<'performance' | 'accessibility' | 'bestPractices' | 'seo', number>>;
    pagespeed?: Partial<Record<'mobile' | 'desktop', number>>;
    coreWebVitals?: Partial<Record<'LCP' | 'CLS' | 'INP' | 'TTFB', string>>;
  };
  /** When the project was built/launched */
  startedAt?: string; // ISO date
  endedAt?: string; // ISO date or undefined if ongoing
  /** Links like live site, repo, case study */
  links?: ProjectLink[];
  /** Media gallery (images/videos) */
  media: ProjectMedia[];
  /** Weight for ordering in lists (lower = earlier) */
  weight?: number;
  /** Include in hero showcase */
  heroShowcase?: boolean;
}

export interface ProjectCollection {
  projects: Project[];
}
