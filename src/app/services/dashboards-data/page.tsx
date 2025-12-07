import type { Metadata } from 'next'
import { ServicePageScaffold } from '@/components/services/ServicePageScaffold'

export const metadata: Metadata = {
  title: 'Custom Dashboards & Data | Services | Tyler Lundin',
  description: 'Functional custom dashboards, analytics, and data pipelines built for clarity and action.'
}

export default function DashboardsDataPage() {
  return (
    <ServicePageScaffold
      title="Custom Dashboards & Data"
      description="Turn raw data into decisions. I build dashboards, data integrations, and reporting flows tailored to your operations."
      currentSlug="dashboards-data"
      features={[
        'Admin or team dashboards with role-based views',
        'Data ingestion and transformation pipelines',
        'Charts, tables, and exports for stakeholders',
        'Integrations with CRMs, ERPs, or third‑party APIs',
      ]}
    />
  )
}
