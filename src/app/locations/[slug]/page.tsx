import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import waCities from '@/config/locations/wa'
import SeoLanding from '@/components/seo/SeoLanding'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return waCities.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const city = waCities.find((c) => c.slug === slug)
  const name = city?.name ?? 'Location'
  const title = `${name} Web Design & Web Developer | Tyler Lundin`
  const description = `Freelance web designer and web developer serving ${name}, Washington — fast websites, SEO, e‑commerce, and maintenance.`
  const images = city?.icon ? [{ url: city.icon }] : undefined
  const keywords = [
    `${name} web design`,
    `${name} web designer`,
    `${name} web developer`,
    `${name} website maintenance`,
    `${name} SEO`,
    `${name} e‑commerce`,
    `${name} Shopify`,
    `${name} WordPress`,
    'Next.js',
    'Web performance',
  ]
  return { title, description, keywords, openGraph: { title, description, images } }
}

export default async function CityLocationPage({ params }: Params) {
  const { slug } = await params
  const city = waCities.find((c) => c.slug === slug)
  if (!city) return notFound()

  const name = city.name
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: `${name}, Washington`,
      image: city.icon ? [city.icon] : undefined,
      areaServed: { '@type': 'AdministrativeArea', name: 'Washington' }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Web Design and Development',
      areaServed: `${name}, Washington`,
      provider: {
        '@type': 'Person',
        name: 'Tyler Lundin'
      }
    }
  ]

  return (
    <SeoLanding
      areaLabel="Washington"
      title={`${name} Web Design & Web Developer`}
      subtitle={`Freelance web designer and web developer serving ${name}, Washington. Fast websites, SEO, e‑commerce, and ongoing maintenance.`}
      primarySectionTitle={`Services in ${name}`}
      bullets={[
        `${name} web design and UI/UX`,
        `${name} web developer for custom sites (Next.js, React, Node)`,
        `${name} website maintenance and updates`,
        `${name} SEO technical audits and on‑page optimization`,
        `${name} e‑commerce (Shopify, custom carts)`,
        'Content structure, performance, and accessibility (a11y)',
      ]}
      whyTitle={`Why choose a local ${name} web developer`}
      whyBullets={[
        'Clear, responsive communication and fast turnaround',
        'Built for speed, SEO, and conversion',
        'Modern stack: Next.js, React, TypeScript',
        'Secure hosting, caching, and monitoring',
        'Flexible retainers for ongoing support',
      ]}
      related={[
        { href: '/services/web-design', label: 'Web Design' },
        { href: '/services/dashboards-data', label: 'Dashboards & Data' },
        { href: '/services/logo-design', label: 'Logo Design' },
        { href: '/services/faq', label: 'FAQ & Pricing' },
      ]}
      faq={[
        { q: `Do you work on existing websites in ${name}?`, a: `Yes — I can audit, fix performance issues, improve SEO, and add features to existing sites in ${name}.` },
        { q: `What platforms do you support in ${name}?`, a: 'I work with modern stacks (Next.js/React), Shopify, and WordPress, and integrate with common CRMs and analytics.' },
        { q: `How soon can you start a ${name} project?`, a: 'I typically start within 1–2 weeks. Share goals and timeline and I’ll confirm availability.' },
      ]}
      schema={schema}
      primaryCtaHref="/contact"
      primaryCtaLabel={`Get a ${name} quote`}
      secondaryCtas={[{ href: '/projects', label: 'See projects' }]}
      showFloatingCta
    />
  )
}

// notFound() comes from next/navigation now

function CityAvatar({ name, icon, size = 6 }: { name: string; icon?: string; size?: number }) {
  const initials = name.slice(0, 2).toUpperCase()
  const dim = size >= 12 ? 'h-12 w-12' : 'h-6 w-6'
  if (icon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt={name} className={`${dim} rounded-sm object-cover border border-black/10 dark:border-white/10`} />
  }
  return (
    <span className={`inline-flex items-center justify-center ${dim} rounded-sm border border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300`}>
      {initials}
    </span>
  )
}
