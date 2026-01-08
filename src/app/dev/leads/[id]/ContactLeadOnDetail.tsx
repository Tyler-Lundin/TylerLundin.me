"use client"
import { useState } from 'react'
import LeadContactWizard from './LeadContactWizard'

type Lead = {
  id: string
  name: string
  location?: string | null
  website?: string | null
  domain?: string | null
  phone?: string | null
  email?: string | null
  google_maps_url?: string | null
  strategy?: any
}

export default function ContactLeadOnDetail({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <button 
        className="h-8 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95" 
        onClick={() => setOpen(true)}
      >
        Contact Lead
      </button>
      <LeadContactWizard 
        open={open} 
        onClose={() => setOpen(false)} 
        lead={lead} 
      />
    </div>
  )
}

