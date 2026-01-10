"use client"

import { useState, useActionState, useEffect } from 'react'
import { addProjectLinkAction } from '@/app/dev/actions/crm'
import CrmModal from '@/app/dev/components/CrmModal'
import { Link as LinkIcon } from 'lucide-react'

export default function NewLinkDialog({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(addProjectLinkAction, null)

  useEffect(() => {
    if (state?.success) setIsOpen(false)
  }, [state])

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
      >
        Add Link
      </button>

      <CrmModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Add Project Link"
        maxWidth="md"
      >
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="project_id" value={projectId} />
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Link Type</label>
              <select 
                name="type" 
                defaultValue="other"
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
              >
                <option value="live">Live Site</option>
                <option value="staging">Staging</option>
                <option value="repo">Repository</option>
                <option value="docs">Documentation</option>
                <option value="design">Design (Figma/etc)</option>
                <option value="tracker">Issue Tracker</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">URL</label>
              <input 
                name="url" 
                required 
                type="url"
                placeholder="https://..."
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Label (Optional)</label>
              <input 
                name="label" 
                placeholder="e.g. Production URL"
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800/50 dark:focus:bg-neutral-950"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                name="is_client_visible" 
                defaultChecked 
                value="true"
                id="is_client_visible"
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:ring-offset-neutral-950"
              />
              <label htmlFor="is_client_visible" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 select-none cursor-pointer">
                Visible to Client
              </label>
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
              <LinkIcon className="size-4" />
              {isPending ? 'Adding...' : 'Add Link'}
            </button>
          </div>
        </form>
      </CrmModal>
    </>
  )
}
