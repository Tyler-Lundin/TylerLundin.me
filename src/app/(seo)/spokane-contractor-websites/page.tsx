import type { Metadata } from 'next'
import SeoLanding from '@/components/seo/SeoLanding'

export const metadata: Metadata = {
  title: 'Websites for Spokane Contractors | Tyler Lundin',
  description: 'Contractor websites in Spokane with lead capture, portfolios, and clear service pages.',
  alternates: { canonical: 'https://tylerlundin.me/spokane-contractor-websites' },
}

export default function SpokaneContractorWebsitesPage() {
  return (
    <SeoLanding
      areaLabel="Verticals"
      title="Websites for Spokane Contractors"
      subtitle="Get more estimate requests with fast pages, clear services, and strong project photos—built for phone users."
      primarySectionTitle="What works"
      bullets={[
        'Service area and specialties up front',
        'Before/after photos and reviews',
        'Simple estimate and contact forms',
        'Fast load, clear CTAs, and tracking',
      ]}
      whyBullets={[
        'Trust quickly: photos, reviews, and licenses on one page.',
        'Clear next steps: estimate or call in one tap.',
        'Track the funnel: see which services drive calls.',
      ]}
      secondaryCtas={[{ href: '/spokane-web-developer', label: 'Spokane developer' }]}
      related={[{ href: '/spokane-web-design', label: 'Spokane Web Design' }, { href: '/spokane-website-maintenance', label: 'Spokane Website Maintenance' }]}
      faq={[
        { q: 'Can you build estimate request forms?', a: 'Yes — short, clear forms that route to your email or CRM.' },
        { q: 'Can you add project photo galleries?', a: 'Absolutely, with fast loading and before/after sections.' },
        { q: 'Can you help with reviews?', a: 'I’ll set up a simple flow to encourage Google reviews.' },
      ]}
    />
  )
}
