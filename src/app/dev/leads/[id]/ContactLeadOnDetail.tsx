"use client"
import { useState } from 'react'
import ContactLeadWizard from '../../groups/[id]/ContactLeadWizard'

type Lead = {
  id: string
  name?: string | null
  location?: string | null
  website?: string | null
  domain?: string | null
  phone?: string | null
  google_maps_url?: string | null
}

export default function ContactLeadOnDetail({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false)

  const member = {
    lead_id: lead.id,
    leads: {
      id: lead.id,
      name: lead.name || undefined,
      location: lead.location || undefined,
      website: lead.website || undefined,
      domain: lead.domain || undefined,
      phone: lead.phone || undefined,
      google_maps_url: lead.google_maps_url || undefined,
    },
  }

  return (
    <div className="flex items-center gap-2">
      <button className="h-8 rounded border px-3 text-sm" onClick={() => setOpen(true)}>Contact Lead</button>
      <ContactLeadWizard open={open} onClose={() => setOpen(false)} groupId={lead.id} members={[member] as any} />
    </div>
  )
}

