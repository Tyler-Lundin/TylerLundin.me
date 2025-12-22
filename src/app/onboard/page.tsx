import { Suspense } from 'react'
import OnboardClient from './OnboardClient'

export const dynamic = 'force-dynamic'

export default function OnboardPage() {
  return (
    <Suspense fallback={null}>
      <OnboardClient />
    </Suspense>
  )
}
