import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DevDock from '@/components/dev/DevDock'
import DevTopNav from '@/components/dev/DevTopNav'
import Ankr from '@/components/ankr/Ankr'

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
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <DevTopNav />
      <main className="pt-16 pb-[6rem]">{children}</main>
      <DevDock />
      <Ankr />
    </div>
  )
}
