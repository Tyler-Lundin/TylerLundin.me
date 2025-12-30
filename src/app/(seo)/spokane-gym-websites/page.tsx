import type { Metadata } from 'next'
import SeoLanding from '@/components/seo/SeoLanding'

export const metadata: Metadata = {
  title: 'Websites for Spokane Gyms & Studios | Tyler Lundin',
  description: 'Gym and studio websites in Spokane with trials, booking, and conversion‑focused design.',
  alternates: { canonical: 'https://tylerlundin.me/spokane-gym-websites' },
}

export default function SpokaneGymWebsitesPage() {
  return (
    <SeoLanding
      areaLabel="Verticals"
      title="Websites for Spokane Gyms & Studios"
      subtitle="Drive trials and sign‑ups with fast pages, clear schedules, and bold CTAs that work great on phones."
      primarySectionTitle="What works"
      bullets={[
        'Clear class schedules and pricing',
        'Trial or intro‑offer landing pages',
        'Reviews and social proof',
        'Fast, mobile‑first design',
      ]}
      whyBullets={[
        'Reduce friction: fewer taps to book or trial.',
        'Clarity: visitors see schedule, pricing, and offer quickly.',
        'Proof: reviews and results increase sign‑up confidence.',
      ]}
      secondaryCtas={[{ href: '/spokane-web-developer', label: 'Spokane developer' }]}
      related={[{ href: '/spokane-web-design', label: 'Spokane Web Design' }, { href: '/spokane-website-maintenance', label: 'Spokane Website Maintenance' }]}
      faq={[
        { q: 'Can you integrate booking systems?', a: 'Yes — I connect with popular schedulers and CRMs.' },
        { q: 'Can you set up trials or offers?', a: 'Absolutely. I’ll design focused landing pages that convert.' },
        { q: 'Do you help with photos or video?', a: 'I can advise and optimize assets for speed and clarity.' },
      ]}
    />
  )
}
