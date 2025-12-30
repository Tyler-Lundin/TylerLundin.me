import type { Metadata } from 'next'
import SeoLanding from '@/components/seo/SeoLanding'

export const metadata: Metadata = {
  title: 'Spokane Web Design | Tyler Lundin',
  description: 'Modern, conversion‑focused web design for Spokane businesses. Clean UX, performance, and content that drives action.',
  alternates: { canonical: 'https://tylerlundin.me/spokane-web-design' },
  openGraph: {
    title: 'Spokane Web Design | Tyler Lundin',
    description: 'Web design for Spokane businesses — fast, clean, and built to convert.',
    url: 'https://tylerlundin.me/spokane-web-design',
    type: 'website',
  },
}

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Spokane Web Design',
  areaServed: { '@type': 'AdministrativeArea', name: 'Spokane, WA' },
  provider: { '@type': 'Person', name: 'Tyler Lundin', url: 'https://tylerlundin.me' },
}

export default function SpokaneWebDesignPage() {
  return (
    <SeoLanding
      areaLabel="Local Services"
      title="Spokane Web Design"
      subtitle="Design that looks great and moves customers to act—clear content structure, responsive layouts, and performance best practices."
      bullets={[
        'Mobile‑first, accessible design system',
        'Content and page structure guidance',
        'Performance budgeting and image strategy',
        'Conversion‑focused CTAs and forms',
      ]}
      whyBullets={[
        'Clarity first: users understand what you offer in seconds.',
        'Fast pages: better Core Web Vitals, better conversions.',
        'Local intent: content tuned for Spokane searches and buyers.',
      ]}
      secondaryCtas={[{ href: '/spokane-web-developer', label: 'Spokane developer' }]}
      related={[{ href: '/spokane-website-maintenance', label: 'Spokane Website Maintenance' }, { href: '/spokane-ecommerce-developer', label: 'Spokane E‑commerce Developer' }]}
      faq={[
        { q: 'Do you redesign or start from scratch?', a: 'Both. We’ll pick the leanest approach to reach your goals quickly.' },
        { q: 'Do you help with copy?', a: 'Yes — I scope pages, structure content, and draft or edit copy.' },
        { q: 'How long does a typical site take?', a: 'Simple sites ship in 2–4 weeks depending on content readiness.' },
      ]}
      schema={[serviceJsonLd as any]}
    />
  )
}
