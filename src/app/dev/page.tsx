'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import JournalForm from '@/components/JournalForm'
import JournalList from '@/components/JournalList'
import ContactMessagesList from '@/components/ContactMessagesList'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardSection from '@/components/DashboardSection'

export default function DevDashboard() {
  const [refreshJournal, setRefreshJournal] = useState(0)
  const [refreshContacts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-token')
        const data = await response.json()

        if (!data.success) {
          // If token is invalid, redirect to login
          router.push('/login')
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error verifying token:', error)
        router.push('/login')
      }
    }

    verifyToken()
  }, [router])

  const handleJournalSubmitted = () => setRefreshJournal(prev => prev + 1)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 px-4 py-8 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <DashboardHeader title="Dev Dashboard" />

        <DashboardSection title="Contact Messages">
          <ContactMessagesList refreshTrigger={refreshContacts} />
        </DashboardSection>

        <DashboardSection title="Journal">
          <JournalForm onEntrySubmitted={handleJournalSubmitted} />
          <JournalList refreshTrigger={refreshJournal} />
        </DashboardSection>
      </div>
    </div>
  )
} 
