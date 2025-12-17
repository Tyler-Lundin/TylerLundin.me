import { servicesTableSchema } from './schema'
import type { Service } from './types'

const raw: Service[] = [
  {
    slug: 'faq',
    title: 'FAQ & Pricing',
    summary: 'Clear answers and typical website cost breakdowns.',
    category: 'general',
    tags: ['pricing', 'faq']
  },
  {
    slug: 'web-hosting',
    title: 'Web Hosting',
    summary: 'Fast, secure hosting with SSL, backups, and monitoring.',
    category: 'hosting',
    tags: ['vercel', 'cloudflare', 'ssl'],
    priceRange: 'from $15/mo'
  },
  {
    slug: 'web-design',
    title: 'Web Design',
    summary: 'Clean, modern designs optimized for conversion and speed.',
    category: 'design',
    tags: ['ux', 'ui', 'performance'],
    priceRange: 'project-based'
  },
  {
    slug: 'logo-design',
    title: 'Logo Design',
    summary: 'Memorable brand identity tailored to your audience.',
    category: 'branding',
    tags: ['brand', 'identity'],
    priceRange: 'project-based'
  },
  {
    slug: 'dashboards-data',
    title: 'Custom Dashboards & Data',
    summary: 'Functional dashboards, data pipelines, and visualizations.',
    category: 'data',
    tags: ['dashboard', 'analytics', 'supabase'],
    priceRange: 'from $499'
  },
  {
    slug: 'authentication',
    title: 'Authentication Systems',
    summary: 'Secure auth, roles, and protected areas users can trust.',
    category: 'auth',
    tags: ['auth', 'rbac', 'supabase'],
    priceRange: 'from $299'
  }
]

export const services = servicesTableSchema.parse(raw)

export function getServices(): Service[] {
  return services
}
