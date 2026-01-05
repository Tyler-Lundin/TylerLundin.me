import { requireRoles } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  try {
    // Allow all marketing roles into the marketing area
    await requireRoles(['admin', 'head_of_marketing', 'head of marketing', 'marketing_editor', 'marketing_analyst'])
  } catch {
    redirect('/login?redirect=/marketing')
  }

  return (
    <div className="min-h-screen">
      <SiteShell>{children}</SiteShell>
    </div>
  )
}
