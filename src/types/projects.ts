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

// Lightweight, card-friendly project summary used in list views
export type ProjectStatus = 'live' | 'in-progress' | 'archived' | 'prototype';

export interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  client?: string;
  role?: string;
  location?: string;
  tech: string[];
  tags?: string[];
  links?: ProjectLink[];
  // Primary hero/cover media. Falls back to first featured media in media[]
  cover?: ProjectMedia;
  // Full gallery for carousel/lightbox
  media?: ProjectMedia[];
  // Visual weight for ordering
  weight?: number;
  // Display badges/flags
  status?: ProjectStatus;
  isHighlight?: boolean;
  hasCaseStudy?: boolean;
  // Timeline hints
  startedAt?: string; // ISO date
  endedAt?: string;   // ISO date or undefined if ongoing
}

// Feature modeling for richer case studies
export type FeatureCategory =
  | 'frontend'
  | 'backend'
  | 'admin'
  | 'commerce'
  | 'integration'
  | 'devops'
  | 'ux'
  | 'performance'
  | 'security';

export interface Feature {
  key?: string;
  title: string;
  summary?: string;
  details?: string[];
  category?: FeatureCategory;
  badges?: string[];
  mediaIds?: string[]; // references into media gallery by id
}

// Explicit modeling for an Admin backend showcase
export interface AdminModule {
  name: string;
  description?: string;
  features?: string[]; // bullet points
}

export interface RolePermission {
  role: string; // e.g. 'admin', 'manager', 'support'
  permissions: string[]; // e.g. 'orders.read', 'catalog.write'
}

export interface AdminBackend {
  fullFeature?: boolean; // callout this as a first-class admin experience
  modules?: AdminModule[];
  permissions?: RolePermission[];
  demoUrl?: string;
  screenshots?: string[]; // media ids referencing admin UI
  tech?: string[]; // admin-specific stack
}

// Commerce specialization for Zevlin and similar projects
export interface CommerceConfig {
  catalog?: {
    products?: boolean;
    variants?: boolean;
    images?: boolean;
    collections?: boolean;
  };
  pricing?: {
    discounts?: boolean;
    promotions?: boolean;
    currency?: string;
  };
  inventory?: {
    tracked?: boolean;
    locations?: boolean;
    backorders?: boolean;
  };
  checkout?: {
    multiStep?: boolean;
    guest?: boolean;
    addressValidation?: boolean;
    shippingCalculator?: boolean;
  };
  orders?: {
    statuses?: string[];
    rma?: boolean; // returns/exchanges
    refunds?: boolean;
  };
  payments?: {
    provider?: string; // e.g., 'Stripe'
    webhooks?: boolean;
    methods?: string[]; // e.g., ['card', 'apple-pay']
  };
  shipping?: {
    providers?: string[];
    liveRates?: boolean;
    zones?: boolean;
  };
  tax?: {
    provider?: string; // e.g., 'TaxJar', 'custom'
    inclusive?: boolean;
  };
}

export interface IntegrationRef {
  name: string; // e.g., 'Stripe', 'Algolia'
  category?: 'payments' | 'analytics' | 'email' | 'search' | 'cms' | 'auth' | 'storage' | 'other';
  provider?: string;
  link?: string;
}

export interface Architecture {
  overview?: string;
  services?: string[]; // microservices/packages
  infra?: string[]; // e.g., 'Vercel', 'Supabase'
  deployment?: string[]; // environments/targets
  diagramMediaId?: string; // media id
}

export interface Metric {
  label: string; // e.g., 'Checkout time'
  value: string | number; // '2.1s' or 2.1
  unit?: string; // 's', '%'
  context?: string; // 'p95 mobile'
}

export interface TimelineMilestone {
  date: string; // ISO
  title: string;
  description?: string;
}

export interface Timeline {
  start?: string; // ISO
  end?: string;   // ISO
  milestones?: TimelineMilestone[];
}

export interface Section {
  key?: string; // 'problem', 'approach', 'solution', 'outcomes'
  title: string;
  body: string; // markdown/plain text
  mediaIds?: string[];
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  avatarSrc?: string;
}

export interface SEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImageId?: string; // media id
}

// Full project model for detail pages and case studies
export interface ProjectFull extends ProjectSummary {
  features?: Feature[];
  adminBackend?: AdminBackend;
  commerce?: CommerceConfig;
  integrations?: IntegrationRef[];
  architecture?: Architecture;
  metrics?: Metric[];
  timeline?: Timeline;
  sections?: Section[];
  testimonials?: Testimonial[];
  seo?: SEO;
  // Preserve original media array for galleries
  media?: ProjectMedia[];
}

// Legacy Project interface kept for backward compatibility during migration.
// New work should prefer ProjectSummary/ProjectFull.
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
