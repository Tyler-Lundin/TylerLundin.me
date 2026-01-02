import type { MetadataRoute } from 'next'
import waCities from '@/config/locations/wa'

const BASE = 'https://tylerlundin.me'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString().slice(0, 10)
  return waCities.map((c) => ({
    url: `${BASE}/locations/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))
}

