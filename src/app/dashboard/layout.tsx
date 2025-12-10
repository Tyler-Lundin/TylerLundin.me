import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Temporary: gate with admin until Supabase Auth for clients is introduced
  try {
    await requireAdmin()
  } catch {
    redirect('/login?redirect=/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 dark:from-black via-transparent to-neutral-100 dark:to-neutral-950">
      {children}
    </div>
  )
}

