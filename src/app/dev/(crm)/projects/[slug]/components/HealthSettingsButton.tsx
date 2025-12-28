"use client"

import { useState, useActionState, useEffect, useRef } from 'react'
import { Settings, Trash2 } from 'lucide-react'
import CrmModal from '@/app/dev/components/CrmModal'
import { updateProjectHealthAction } from '@/app/dev/actions/crm'

export default function HealthSettingsButton({ projectId, url, enabled }: { projectId: string; url?: string | null; enabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(updateProjectHealthAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { if (state?.success) setOpen(false) }, [state])

  return (
    <>
      <button
        title="Health settings"
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-[#2a2b30] border border-[#3F4147]"
      >
        <Settings className="h-4 w-4" />
      </button>
      <CrmModal isOpen={open} onClose={() => setOpen(false)} title="Health Settings" maxWidth="md">
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={projectId} />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">Health URL</label>
            <input name="project_health_url" defaultValue={url || ''} required type="url" placeholder="https://app.example.com/health" className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">Shared Secret</label>
            <input name="project_health_secret" type="text" placeholder="Same value configured on the target project" className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="project_health_enabled" defaultChecked={Boolean(enabled)} className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" />
            Enable health checks
          </label>
          {state?.error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-900/10 dark:text-rose-400">
              {typeof state.error === 'string' ? state.error : Object.values(state.error).flat().join(', ')}
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                const form = formRef.current
                if (!form) return
                const urlInput = form.querySelector<HTMLInputElement>('input[name="project_health_url"]')
                const secInput = form.querySelector<HTMLInputElement>('input[name="project_health_secret"]')
                const enInput = form.querySelector<HTMLInputElement>('input[name="project_health_enabled"]')
                if (urlInput) urlInput.value = ''
                if (secInput) secInput.value = ''
                if (enInput) enInput.checked = false
                form.requestSubmit()
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear & Disable
            </button>
            <button type="submit" disabled={pending} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
              {pending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </CrmModal>
    </>
  )
}
