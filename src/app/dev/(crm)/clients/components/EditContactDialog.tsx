"use client"

import { useState, useActionState, useEffect } from 'react'
import CrmModal from '@/app/dev/components/CrmModal'
import { updateContactAction } from '@/app/dev/actions/crm'

type Contact = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  title?: string | null
}

export default function EditContactDialog({ contact }: { contact: Contact }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(updateContactAction, null)

  useEffect(() => {
    if (state?.success) setIsOpen(false)
  }, [state])

  const inputClasses = "w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
      >
        Edit
      </button>

      <CrmModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Edit Contact"
        maxWidth="md"
      >
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={contact.id} />
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Full Name</label>
              <input 
                name="name" 
                required 
                defaultValue={contact.name}
                placeholder="Jane Doe"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Job Title</label>
              <input 
                name="title" 
                defaultValue={contact.title || ''}
                placeholder="CEO, Marketing Director, etc."
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Email Address</label>
                <input 
                  type="email"
                  name="email" 
                  defaultValue={contact.email || ''}
                  placeholder="jane@example.com"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Phone Number</label>
                <input 
                  type="tel"
                  name="phone" 
                  defaultValue={contact.phone || ''}
                  placeholder="+1 (555) 000-0000"
                  className={inputClasses}
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
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </CrmModal>
    </>
  )
}
