"use client"

import ContactMessagesList from '@/components/ContactMessagesList'

export default function InboxModule() {
  return (
    <div className="space-y-6">
      <ContactMessagesList refreshTrigger={0} />
    </div>
  )
}

