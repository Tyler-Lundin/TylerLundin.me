import type { Metadata } from 'next'
import SeoLanding from '@/components/seo/SeoLanding'

export const metadata: Metadata = {
  title: 'Spokane E‑commerce Developer | Tyler Lundin',
  description: 'E‑commerce builds and integrations for Spokane businesses: product catalogs, checkout, and performance.',
  alternates: { canonical: 'https://tylerlundin.me/spokane-ecommerce-developer' },
  openGraph: {
    title: 'Spokane E‑commerce Developer | Tyler Lundin',
    description: 'E‑commerce storefronts and integrations built for speed and conversion.',
    url: 'https://tylerlundin.me/spokane-ecommerce-developer',
    type: 'website',
  },
}

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Spokane E‑commerce Development',
  areaServed: { '@type': 'AdministrativeArea', name: 'Spokane, WA' },
  provider: { '@type': 'Person', name: 'Tyler Lundin', url: 'https://tylerlundin.me' },
}

export default function SpokaneEcommerceDeveloperPage() {
  return (
    <SeoLanding
      areaLabel="Local Services"
      title="Spokane E‑commerce Developer"
      subtitle="E‑commerce stores that load quickly and convert—lean product pages, clean checkout, and optional integrations."
      primarySectionTitle="What’s included"
      bullets={[
        'Product and category templates',
        'Optimized images and performance budgets',
        'Payments and basic tax/shipping options',
        'Analytics and event tracking',
      ]}
      whyBullets={[
        'Lean pages that emphasize products and outcomes.',
        'Checkout clarity reduces drop‑off and cart friction.',
        'Measurement first: track add‑to‑cart and conversions.',
      ]}
      secondaryCtas={[{ href: '/spokane-web-developer', label: 'Spokane developer' }]}
      related={[{ href: '/spokane-web-design', label: 'Spokane Web Design' }, { href: '/spokane-website-maintenance', label: 'Spokane Website Maintenance' }]}
      faq={[
        { q: 'Which platforms do you work with?', a: 'Headless/Next.js front‑ends, Shopify, or simple Stripe‑powered flows.' },
        { q: 'Can you migrate my store?', a: 'Yes — we’ll plan content, SEO, and redirects to preserve value.' },
        { q: 'Do you handle taxes and shipping?', a: 'Basic configuration is included; I’ll coordinate with your provider as needed.' },
      ]}
      schema={[serviceJsonLd as any]}
    />
  )
}
