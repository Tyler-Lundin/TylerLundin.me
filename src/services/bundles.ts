import type { Bundle } from './types'
import { bundlesTableSchema } from './schema'

const raw: Bundle[] = [
  {
    slug: 'launch',
    title: 'Launch bundle',
    summary:
      'Web design + hosting + basic analytics. Get online fast with the right foundations.',
    priceRange: 'project + from $15/mo',
    billing: 'project',
    serviceSlugs: ['web-design', 'web-hosting'],
    features: [
      'Clean, conversion-focused design',
      'Fast hosting with SSL & backups',
      'Basic analytics and uptime checks'
    ],
    tags: ['launch', 'marketing-site']
  },
  {
    slug: 'operate',
    title: 'Operate bundle',
    summary:
      'Dashboards + auth + roles. Streamline internal workflows and protected areas.',
    priceRange: 'from $499 + from $15/mo',
    billing: 'monthly',
    serviceSlugs: ['dashboards-data', 'authentication', 'web-hosting'],
    features: ['Role-based access', 'Custom dashboards', 'Secure hosting'],
    tags: ['internal-tools', 'portal']
  }
]

export const bundles = bundlesTableSchema.parse(raw)

export function getBundles(): Bundle[] {
  return bundles
}

export function getBundleBySlug(slug: string): Bundle | undefined {
  return bundles.find((b) => b.slug === slug)
}

