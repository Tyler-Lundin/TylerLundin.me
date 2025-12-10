import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 max-w-screen overflow-x-hidden">
      {children}
    </div>
  )
} 
