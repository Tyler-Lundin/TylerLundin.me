import type { Metadata } from 'next'
import { ServicePageScaffold } from '@/components/services/ServicePageScaffold'

export const metadata: Metadata = {
  title: 'Web Hosting | Services | Tyler Lundin',
  description: 'Fast, secure website hosting with SSL, backups, monitoring, and updates.'
}

export default function WebHostingPage() {
  return (
    <ServicePageScaffold
      title="Web Hosting"
      description="Reliable, secure, and performance-focused hosting. I handle the setup, SSL, backups, monitoring, and ongoing updates."
      currentSlug="web-hosting"
      features={[
        'Managed hosting with global CDN',
        'Free SSL and domain setup',
        'Automated backups and rollbacks',
        'Uptime and performance monitoring',
        'Security patches and routine updates',
      ]}
    />
  )
}
