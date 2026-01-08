"use client"

import { useState, useActionState, useEffect } from 'react'
import CrmModal from '@/app/dev/components/CrmModal'
import { updateClientAction } from '@/app/dev/actions/crm'

type Client = {
  id: string
  name: string
  company?: string | null
  website_url?: string | null
  phone?: string | null
  billing_notes?: string | null
}

export default function EditClientDialog({ client }: { client: Client }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(updateClientAction, null)

  useEffect(() => {
    if (state?.success) setIsOpen(false)
  }, [state])

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        Edit Details
      </button>

      <CrmModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Edit Client Information"
        maxWidth="lg"
      >
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={client.id} />
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Client Name</label>
              <input 
                name="name" 
                defaultValue={client.name} 
                required 
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Company</label>
                <input 
                  name="company" 
                  defaultValue={client.company || ''} 
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Website</label>
                <input 
                  name="website_url" 
                  type="url"
                  defaultValue={client.website_url || ''} 
                  placeholder="https://"
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Main Phone</label>
              <input 
                name="phone" 
                defaultValue={client.phone || ''} 
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Billing Notes</label>
              <textarea 
                name="billing_notes" 
                rows={4} 
                defaultValue={client.billing_notes || ''}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
              />
            </div>
          </div>

          {state?.error && (
            <div className="rounded-xl bg-rose-50 p-4 text-xs text-rose-600 dark:bg-rose-900/10 dark:text-rose-400">
              {typeof state.error === 'string' 
                ? state.error 
                : Object.values(state.error).flat().join(', ')}
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