import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DevFab from '@/components/dev/DevFab'
import DevBreadcrumbs from '@/components/dev/DevBreadcrumbs'
import { SiteShell } from '@/components/layout/SiteShell'

export default async function DevLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAdmin()
  } catch {
    redirect('/login?redirect=/dev')
  }

  return (
    <div className="min-h-screen pt-6">
      <DevBreadcrumbs />
      <SiteShell>
        {children}
      </SiteShell>
      <DevFab />
    </div>
  )
}
