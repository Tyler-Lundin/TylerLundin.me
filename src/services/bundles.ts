import type { Bundle } from './types'
import { bundlesTableSchema } from './schema'

const raw: Bundle[] = [
  // SMALL — Get them live fast, no fluff.
  {
    slug: 'launch',
    title: 'Launch',
    summary:
      'A clean, professional website that looks great on phones and desktops — plus reliable hosting. Get online quickly with the right basics handled for you.',
    priceRange: '$499 + $15/mo',
    billing: 'project',
    serviceSlugs: ['web-design', 'web-hosting', 'analytics-basic'],
    features: [
      'Professional 1–3 page site that’s easy to navigate',
      'Looks great on phones and computers; secure https padlock',
      'Simple contact form that delivers to your email',
      'Basic Google setup so pages show with the right titles',
      'Monitoring, backups, and a few quick content tweaks included'
    ],
    tags: ['small', 'marketing-site', 'fast'],
    bgImg: '/images/bundles/launch.webp',
    className: 'object-top'
  },

  // MEDIUM — Most profitable “default” for local businesses.
  {
    slug: 'grow',
    title: 'Grow',
    summary:
      'A fuller small‑business website that helps new customers find you and contact you — with ongoing care and improvements each month.',
    priceRange: '$999 + $49/mo',
    billing: 'project',
    serviceSlugs: [
      'web-design',
      'web-hosting',
      'seo-setup',
      'analytics-ga4',
      'content-updates'
    ],
    features: [
      '5–8 page site (home, services, about, contact, FAQ)',
      'Set up to be found on Google (titles, copy, sitemap)',
      'See what’s working with simple traffic insights',
      'Contact forms that protect against spam and capture leads',
      'Monthly improvements, checks, and content updates'
    ],
    tags: ['medium', 'local-business', 'seo'],
    bgImg: '/images/bundles/grow.webp',
    className: ''
  },

  // LARGE — For portals / internal tools / serious build work.
  {
    slug: 'operate',
    title: 'Operate',
    summary:
      'Sign‑in areas, dashboards, and simple internal tools. Give different people the right access and streamline routine work.',
    priceRange: 'from $2,500 + $99/mo',
    billing: 'project',
    serviceSlugs: [
      'dashboards-data',
      'authentication',
      'roles-permissions',
      'integrations-automation',
      'web-hosting'
    ],
    features: [
      'People can sign in securely (employees, customers, or members)',
      'Give the right access to the right roles (owner, staff, etc.)',
      'Clear dashboards for key info; tables and filters that make sense',
      'Practical forms and approvals to move work along',
      'Connect to the tools you already use (payments, email, CRM)',
      'Reliable hosting with backups and monitoring handled'
    ],
    tags: ['large', 'internal-tools', 'portal', 'saas'],
    bgImg: '/images/bundles/operate.webp',
    className: ''
  }
]

export const bundles = bundlesTableSchema.parse(raw)

export function getBundles(): Bundle[] {
  return bundles
}

export function getBundleBySlug(slug: string): Bundle | undefined {
  return bundles.find((b) => b.slug === slug)
}
