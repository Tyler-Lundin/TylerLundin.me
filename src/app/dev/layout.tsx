export const dynamic = 'force-dynamic'
import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SiteShell } from '@/components/layout/SiteShell'
import { ActiveProjectProvider } from '@/components/dev/ActiveProjectContext'
import { cookies } from 'next/headers'

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

  const cookieStore = await cookies()
  const initialProjectId = cookieStore.get('dev_active_project')?.value || null

  return (
    <div className="min-h-screen">
      <SiteShell>
        <ActiveProjectProvider initialProjectId={initialProjectId}>
          {children}
        </ActiveProjectProvider>
      </SiteShell>
    </div>
  )
}
