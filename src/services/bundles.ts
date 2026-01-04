import type { Bundle } from './types'
import { bundlesTableSchema } from './schema'

const raw: Bundle[] = [
  // SMALL — Get them live fast, no fluff.
  // {
  //   slug: 'launch',
  //   title: 'Launch',
  //   summary:
  //     'A clean, professional website that looks great on phones and desktops — plus reliable hosting. Get online quickly with the right basics handled for you.',
  //   priceRange: '$499 + $15/mo',
  //   billing: 'project',
  //   serviceSlugs: ['web-design', 'web-hosting', 'analytics-basic'],
  //   features: [
  //     'Professional 1–3 page site that’s easy to navigate',
  //     'Looks great on phones and computers; secure https padlock',
  //     'Simple contact form that delivers to your email',
  //     'Basic Google setup so pages show with the right titles',
  //     'Monitoring, backups, and a few quick content tweaks included'
  //   ],
  //   tags: ['small', 'marketing-site', 'fast'],
  //   bgImg: '/images/bundles/launch.webp',
  //   className: 'object-top'
  // },

  // MEDIUM — Most profitable “default” for local businesses.
  // {
  //   slug: 'grow',
  //   title: 'Grow',
  //   summary:
  //     'A fuller small-business website that helps new customers find you and contact you — with ongoing care and improvements each month.',
  //   priceRange: '$999 + $49/mo',
  //   billing: 'project',
  //   serviceSlugs: [
  //     'web-design',
  //     'web-hosting',
  //     'seo-setup',
  //     'analytics-ga4',
  //     'content-updates'
  //   ],
  //   features: [
  //     '5–8 page site (home, services, about, contact, FAQ)',
  //     'Set up to be found on Google (titles, copy, sitemap)',
  //     'See what’s working with simple traffic insights',
  //     'Contact forms that protect against spam and capture leads',
  //     'Monthly improvements, checks, and content updates'
  //   ],
  //   tags: ['medium', 'local-business', 'seo'],
  //   bgImg: '/images/bundles/grow.webp',
  //   className: ''
  // },

  // LARGE — For portals / internal tools / serious build work.
  // {
  //   slug: 'operate',
  //   title: 'Operate',
  //   summary:
  //     'Sign-in areas, dashboards, and simple internal tools. Give different people the right access and streamline routine work.',
  //   priceRange: 'from $2,500 + $99/mo',
  //   billing: 'project',
  //   serviceSlugs: [
  //     'dashboards-data',
  //     'authentication',
  //     'roles-permissions',
  //     'integrations-automation',
  //     'web-hosting'
  //   ],
  //   features: [
  //     'People can sign in securely (employees, customers, or members)',
  //     'Give the right access to the right roles (owner, staff, etc.)',
  //     'Clear dashboards for key info; tables and filters that make sense',
  //     'Practical forms and approvals to move work along',
  //     'Connect to the tools you already use (payments, email, CRM)',
  //     'Reliable hosting with backups and monitoring handled'
  //   ],
  //   tags: ['large', 'internal-tools', 'portal', 'saas'],
  //   bgImg: '/images/bundles/operate.webp',
  //   className: ''
  // },

  // STARTER — Entry level: simple, clean, and live fast.
  {
    slug: 'starter',
    title: 'Starter',
    summary:
      'A simple, polished site for a local business with the essentials done right. Perfect when you just need to look legit and start getting calls.',
    priceRange: '$399',
    billing: 'project',
    serviceSlugs: ['web-design', 'web-hosting', 'analytics-basic'],
    features: [
      'Single-page or small 1–2 page setup (home + contact)',
      'Mobile-first layout with fast load times',
      'Contact form wired to your email',
      'Basic on-page setup (titles, descriptions, favicon)',
      'Deployed live with SSL and reliable hosting'
    ],
    tags: ['starter', 'small', 'fast'],
    bgImg: '/images/bundles/starter.png',
    className: 'object-center'
  },

  // STANDARD — The default: more pages, better discovery, more polish.
  {
    slug: 'standard',
    title: 'Standard',
    summary:
      'A complete small-business website with stronger structure, better Google setup, and the polish most clients actually want.',
    priceRange: '$499',
    billing: 'project',
    serviceSlugs: ['web-design', 'web-hosting', 'seo-setup', 'analytics-ga4'],
    features: [
      '3–5 pages (home, services, about, contact, plus 1 extra)',
      'Improved SEO setup (sitemap, metadata, indexing basics)',
      'Google Analytics (GA4) connected for traffic insights',
      'Spam-protected lead forms',
      'Cleaner UI system for consistent sections and buttons'
    ],
    tags: ['standard', 'local-business', 'seo'],
    bgImg: '/images/bundles/standard.png',
    className: 'object-center'
  },

  // ADVANCED — High value: systems, automation, and admin style workflows.
  {
    slug: 'advanced',
    title: 'Advanced',
    summary:
      'For businesses that need more than marketing pages: quoting, intake flows, light dashboards, or automations that save time.',
    priceRange: '$599',
    billing: 'project',
    serviceSlugs: [
      'web-design',
      'web-hosting',
      'seo-setup',
      'analytics-ga4',
      'integrations-automation'
    ],
    features: [
      '5–8 pages or modular sections depending on the business',
      'Lead intake flow (multi-step form or request wizard)',
      'Automation hooks (email routing, CRM handoff, or notifications)',
      'Performance pass (image optimization and core web vitals basics)',
      'Foundation for future upgrades (dashboards, auth, portals)'
    ],
    tags: ['advanced', 'automation', 'systems'],
    bgImg: '/images/bundles/advanced.png',
    className: 'object-center'
  }
]

export const bundles = bundlesTableSchema.parse(raw)

export function getBundles(): Bundle[] {
  return bundles
}

export function getBundleBySlug(slug: string): Bundle | undefined {
  return bundles.find((b) => b.slug === slug)
}

