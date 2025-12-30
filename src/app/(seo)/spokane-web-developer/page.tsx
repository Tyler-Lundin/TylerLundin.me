import type { Metadata } from 'next'
import SeoLanding from '@/components/seo/SeoLanding'

export const metadata: Metadata = {
  title: 'Spokane Web Developer | Tyler Lundin',
  description:
    'Looking for a Spokane web developer? I build fast, clean, conversion‑focused websites for local businesses in Spokane and the Inland Northwest.',
  alternates: {
    canonical: 'https://tylerlundin.me/spokane-web-developer',
  },
  openGraph: {
    title: 'Spokane Web Developer | Tyler Lundin',
    description:
      'Fast, modern websites for Spokane businesses — clear scopes, solid performance, and results-focused builds.',
    url: 'https://tylerlundin.me/spokane-web-developer',
    type: 'website',
  },
}

const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+1-509-000-0000'

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Tyler Lundin — Spokane Web Developer',
  image: 'https://tylerlundin.me/images/tyler.png',
  url: 'https://tylerlundin.me/spokane-web-developer',
  telephone: PHONE,
  email: 'msg@tylerlundin.me',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Spokane',
    addressRegion: 'WA',
    postalCode: '99201',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'City', name: 'Spokane' },
    { '@type': 'City', name: 'Spokane Valley' },
    { '@type': 'Place', name: 'Inland Northwest' },
  ],
  sameAs: [
    'https://github.com/Tyler-Lundin',
    'https://www.linkedin.com/in/tyler-l-81b839378',
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ],
      opens: '09:00',
      closes: '17:00',
    },
  ],
  priceRange: '$$'
}

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Spokane Web Development',
  provider: {
    '@type': 'Person',
    name: 'Tyler Lundin',
    url: 'https://tylerlundin.me',
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Spokane, WA'
  },
  offers: {
    '@type': 'Offer',
    url: 'https://tylerlundin.me/spokane-web-developer',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  }
}

export default function SpokaneWebDeveloperPage() {
  return (
    <SeoLanding
      areaLabel="Local Services"
      title="Spokane Web Developer"
      subtitle="I build fast, clean, conversion‑focused websites for Spokane businesses — designed to load quickly, look sharp on phones, and turn visitors into calls and bookings."
      primarySectionTitle="What I do"
      bullets={[
        'Custom websites and landing pages that load fast',
        'Booking, lead capture, and e‑commerce integrations',
        'On‑page SEO and content structure for local search',
        'Hosting, backups, monitoring, and ongoing care',
      ]}
      secondaryCtas={[{ href: '/services', label: 'Services' }, { href: '/spokane-web-design', label: 'Spokane Web Design' }]}
      related={[{ href: '/spokane-web-design', label: 'Spokane Web Design' }, { href: '/spokane-website-maintenance', label: 'Spokane Website Maintenance' }]}
      whyTitle="Why it works"
      whyBullets={[
        'Clarity first: users understand what you offer in seconds.',
        'Fast pages: better Core Web Vitals, better conversions.',
        'Local intent: content tuned for Spokane searches and buyers.',
      ]}
      faq={[
        { q: 'How quickly can we start?', a: 'Typically within 1–2 weeks. I keep a small workload to stay responsive.' },
        { q: 'Do you handle hosting and maintenance?', a: 'Yes — I provide performance‑first hosting with backups, monitoring, and updates.' },
        { q: 'Can you help with SEO?', a: 'On‑page SEO and content structure are included. I can also guide local SEO (GBP, reviews, citations).' },
      ]}
      schema={[localBusinessJsonLd as any, serviceJsonLd as any]}
    />
  )
}
