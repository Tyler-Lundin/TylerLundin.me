import type { Metadata } from 'next'
import { ServicePageScaffold } from '@/components/services/ServicePageScaffold'

export const metadata: Metadata = {
  title: 'Authentication Systems | Services | Tyler Lundin',
  description: 'Secure authentication and authorization: email/password, OAuth, roles, and protected areas.'
}

export default function AuthenticationPage() {
  return (
    <ServicePageScaffold
      title="Authentication Systems"
      description="Secure, user-friendly authentication and authorization with best practices baked in—from onboarding to access control."
      currentSlug="authentication"
      features={[
        'Email/password, magic links, or OAuth (Google, etc.)',
        'Role-based access control (RBAC) and permissions',
        'Protected routes, sessions, and multi-factor options',
        'Security best practices and auditing',
      ]}
    />
  )
}
