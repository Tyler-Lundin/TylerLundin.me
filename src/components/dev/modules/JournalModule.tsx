"use client"

import JournalForm from '@/components/JournalForm'
import JournalList from '@/components/JournalList'
import { useState } from 'react'

export default function JournalModule() {
  const [refresh, setRefresh] = useState(0)
  return (
    <div className="space-y-6">
      <JournalForm onEntrySubmitted={() => setRefresh((v) => v + 1)} />
      <JournalList refreshTrigger={refresh} />
    </div>
  )
}

