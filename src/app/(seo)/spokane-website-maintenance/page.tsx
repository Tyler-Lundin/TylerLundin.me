import type { Metadata } from 'next'
import SeoLanding from '@/components/seo/SeoLanding'

export const metadata: Metadata = {
  title: 'Spokane Website Maintenance | Tyler Lundin',
  description: 'Keep your Spokane website fast, secure, and up-to-date. Monitoring, backups, and proactive care.',
  alternates: { canonical: 'https://tylerlundin.me/spokane-website-maintenance' },
  openGraph: {
    title: 'Spokane Website Maintenance | Tyler Lundin',
    description: 'Monitoring, backups, updates, and small fixes to keep your site running smoothly.',
    url: 'https://tylerlundin.me/spokane-website-maintenance',
    type: 'website',
  },
}

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Spokane Website Maintenance',
  areaServed: { '@type': 'AdministrativeArea', name: 'Spokane, WA' },
  provider: { '@type': 'Person', name: 'Tyler Lundin', url: 'https://tylerlundin.me' },
}

export default function SpokaneWebsiteMaintenancePage() {
  return (
    <SeoLanding
      areaLabel="Local Services"
      title="Spokane Website Maintenance"
      subtitle="Backups, updates, monitoring, and small fixes—practical care to keep your site fast, secure, and available."
      primarySectionTitle="What’s included"
      bullets={[
        'Uptime and performance monitoring',
        'Automated backups and restores',
        'Security patches and dependency updates',
        'Small content updates and fixes',
      ]}
      whyBullets={[
        'Less downtime: alerts and backups avoid emergencies.',
        'Security updates: patch quickly without breaking the site.',
        'Small fixes fast: ship tweaks without heavy processes.',
      ]}
      secondaryCtas={[{ href: '/spokane-web-developer', label: 'Spokane developer' }]}
      related={[{ href: '/spokane-web-design', label: 'Spokane Web Design' }, { href: '/spokane-ecommerce-developer', label: 'Spokane E‑commerce Developer' }]}
      faq={[
        { q: 'Do you maintain WordPress or Next.js sites?', a: 'Yes — I handle both, with sensible update processes for each stack.' },
        { q: 'What’s included each month?', a: 'Monitoring, backups, updates, and a bucket of time for small changes.' },
        { q: 'Can you take over an existing site?', a: 'Yes — I’ll audit it first, then recommend a safe, staged plan.' },
      ]}
      schema={[serviceJsonLd as any]}
    />
  )
}
