import type { Metadata } from 'next'
import { ServicePageScaffold } from '@/components/services/ServicePageScaffold'

export const metadata: Metadata = {
  title: 'Web Design | Services | Tyler Lundin',
  description: 'Clean, modern web design focused on clarity, speed, and conversion.'
}

export default function WebDesignPage() {
  return (
    <ServicePageScaffold
      title="Web Design"
      description="Thoughtful, conversion-first interfaces that look great and load fast—tailored to your brand and audience."
      currentSlug="web-design"
      features={[
        'Responsive designs built with accessibility in mind',
        'Style guide and component-driven approach',
        'Content structure and page strategy',
        'Performance and SEO-friendly markup',
      ]}
    />
  )
}
