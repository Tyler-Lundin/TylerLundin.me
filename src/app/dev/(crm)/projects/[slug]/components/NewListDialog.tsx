"use client"

import { useState, useActionState, useEffect } from 'react'
import { X, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createProjectListAction } from '@/app/dev/actions/crm'
import CrmModal from '@/app/dev/components/CrmModal'

export default function NewListDialog({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createProjectListAction, null)

  useEffect(() => {
    if (state?.success) setIsOpen(false)
  }, [state])

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="h-7 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11px] font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm"
      >
        New List
      </button>

      <CrmModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Create New List"
        maxWidth="md"
      >
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="project_id" value={projectId} />
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">List Title</label>
              <input 
                name="title" 
                required 
                placeholder="e.g. Q1 Goals, UX Refinement..."
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Collection Type</label>
              <select 
                name="key" 
                defaultValue="tasks"
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50"
              >
                <option value="goals">Goals (Strategic)</option>
                <option value="tasks">Tasks (Operational)</option>
                <option value="bugs">Bugs (Technical)</option>
                <option value="custom">Custom Collection</option>
              </select>
            </div>
          </div>

          {state?.error && (
            <div className="rounded-xl bg-rose-50 p-4 text-xs text-rose-600 dark:bg-rose-900/10 dark:text-rose-400">
              {typeof state.error === 'string' ? state.error : 'Validation failed'}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isPending}
              className="group flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              {isPending ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </CrmModal>
    </>
  )
}
