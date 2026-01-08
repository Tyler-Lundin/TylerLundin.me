"use client"

import { useState, useActionState, useEffect } from 'react'
import CrmModal from '@/app/dev/components/CrmModal'
import { createContactAction } from '@/app/dev/actions/crm'

export default function NewContactDialog({ clientId }: { clientId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createContactAction, null)

  useEffect(() => {
    if (state?.success) setIsOpen(false)
  }, [state])

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
      >
        Add Contact
      </button>

      <CrmModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Add Primary Contact"
        maxWidth="md"
      >
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="client_id" value={clientId} />
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Full Name</label>
              <input 
                name="name" 
                required 
                placeholder="Jane Doe"
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Job Title</label>
              <input 
                name="title" 
                placeholder="CEO, Marketing Director, etc."
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Email Address</label>
                <input 
                  type="email"
                  name="email" 
                  placeholder="jane@example.com"
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Phone Number</label>
                <input 
                  type="tel"
                  name="phone" 
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
                />
              </div>
            </div>
          </div>

          {state?.error && typeof state.error === 'string' && (
            <div className="rounded-xl bg-rose-50 p-4 text-xs text-rose-600 dark:bg-rose-900/10 dark:text-rose-400">
              {state.error}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isPending}
              className="group flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              {isPending ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </CrmModal>
    </>
  )
}