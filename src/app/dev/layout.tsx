import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DevFab from '@/components/dev/DevFab'

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
    <div className="min-h-screen bg-red text-[#DBDEE1]">
      <main className="pt-4 pb-[6rem]">
        {children}
      </main>
      <DevFab />
    </div>
  )
}
