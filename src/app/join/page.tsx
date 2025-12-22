import { Suspense } from 'react'
import JoinClient from './JoinClient'

export const dynamic = 'force-dynamic'

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinClient />
    </Suspense>
  )
}
