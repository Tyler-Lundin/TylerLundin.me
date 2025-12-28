"use client"

import { useState, useActionState, useEffect } from 'react'
import { GitBranch, Loader2 } from 'lucide-react'
import CrmModal from '@/app/dev/components/CrmModal'
import { addProjectLinkAction } from '@/app/dev/actions/crm'

export default function AddRepoDialog({ projectId, onAdded }: { projectId: string, onAdded?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(addProjectLinkAction, null)

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false)
      if (onAdded) onAdded()
    }
  }, [state, onAdded])

  // Shared input styling to keep things DRY and consistent
  const inputStyles = `
    w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200
    border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400
    focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-100
    dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-100 dark:placeholder:text-neutral-500
    dark:focus:border-neutral-600 dark:focus:bg-neutral-900 dark:focus:ring-neutral-800/40
  `

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white shadow-sm"
      >
        <GitBranch className="size-3.5" /> Connect Repository
      </button>

      <CrmModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Link GitHub Repository"
        maxWidth="md"
      >
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="type" value="repo" />
          <input type="hidden" name="is_client_visible" value="true" />
          
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Repository URL
              </label>
              <input 
                name="url" 
                type="url"
                required 
                placeholder="https://github.com/owner/repo"
                className={inputStyles}
              />
              <p className="mt-2 text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
                Connect a GitHub or GitLab repository to enable live activity tracking.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Display Label (Optional)
              </label>
              <input 
                name="label" 
                placeholder="e.g. Production API"
                className={inputStyles}
              />
            </div>
          </div>

          {state?.error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600 dark:border-rose-900/50 dark:bg-rose-900/10 dark:text-rose-400">
              {typeof state.error === 'string' 
                ? state.error 
                : Object.values(state.error).flat().join(', ')}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isPending}
              className="group flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Linking...
                </>
              ) : (
                'Connect Repository'
              )}
            </button>
          </div>
        </form>
      </CrmModal>
    </>
  )
}
