'use client'

import { useState } from 'react'
import JournalForm from '@/components/JournalForm'
import JournalList from '@/components/JournalList'
import ContactList from '@/components/ContactList'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardSection from '@/components/DashboardSection'

export default function DevDashboard() {
  const [refreshJournal, setRefreshJournal] = useState(0)
  const [refreshContacts] = useState(0)

  const handleJournalSubmitted = () => setRefreshJournal(prev => prev + 1)

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <DashboardHeader title="Dev Dashboard" />

        <DashboardSection title="Contact Messages">
          <ContactList refreshTrigger={refreshContacts} />
        </DashboardSection>

        <DashboardSection title="Journal">
          <JournalForm onEntrySubmitted={handleJournalSubmitted} />
          <JournalList refreshTrigger={refreshJournal} />
        </DashboardSection>
      </div>
    </div>
  )
} 
