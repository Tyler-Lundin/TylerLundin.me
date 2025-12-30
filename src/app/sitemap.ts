import type { MetadataRoute } from 'next'
import { services } from '@/services'

const BASE = 'https://tylerlundin.me'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString().slice(0, 10)

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/spokane-web-developer`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/spokane-web-design`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/spokane-website-maintenance`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/spokane-ecommerce-developer`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/spokane-gym-websites`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/spokane-contractor-websites`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]

  const servicePages: MetadataRoute.Sitemap = services
    .map((s) => ({
      url: `${BASE}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  return [...staticPages, ...servicePages]
}
