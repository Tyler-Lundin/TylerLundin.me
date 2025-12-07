import type { Metadata } from 'next'
import { ServicePageScaffold } from '@/components/services/ServicePageScaffold'

export const metadata: Metadata = {
  title: 'Logo Design | Services | Tyler Lundin',
  description: 'Distinctive logo and brand marks designed for clarity and recognition.'
}

export default function LogoDesignPage() {
  return (
    <ServicePageScaffold
      title="Logo Design"
      description="Memorable visual identity that scales from favicon to billboard—aligned with your voice and audience."
      currentSlug="logo-design"
      features={[
        'Concept exploration and iteration',
        'Primary logo, mark, and variations',
        'Color palette and typography recommendations',
        'Exported assets in multiple formats',
      ]}
    />
  )
}
