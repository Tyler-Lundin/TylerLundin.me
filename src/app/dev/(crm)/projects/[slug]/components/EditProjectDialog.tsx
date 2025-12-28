"use client"

import { useActionState, useEffect, useState } from 'react'
import CrmModal from '@/app/dev/components/CrmModal'
import { updateProjectAction } from '@/app/dev/actions/crm'

type Project = {
  id: string
  title: string
  slug: string
  description?: string | null
  status: 'planned' | 'in_progress' | 'paused' | 'completed' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export default function EditProjectDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(updateProjectAction, null)

  useEffect(() => {
    if (state?.success) setOpen(false)
  }, [state])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        Edit Project
      </button>
      <CrmModal isOpen={open} onClose={() => setOpen(false)} title="Edit Project" maxWidth="lg">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={project.id} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">Title</label>
              <input
                name="title"
                defaultValue={project.title}
                required
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">Slug</label>
              <input
                name="slug"
                defaultValue={project.slug}
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                required
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={project.description || ''}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">Status</label>
              <select name="status" defaultValue={project.status} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
                {['planned','in_progress','paused','completed','archived'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">Priority</label>
              <select name="priority" defaultValue={project.priority} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
                {['low','normal','high','urgent'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {state?.error && (
            <div className="rounded-xl bg-rose-50 p-4 text-xs text-rose-600 dark:bg-rose-900/10 dark:text-rose-400">
              {typeof state.error === 'string' ? state.error : Object.values(state.error).flat().join(', ')}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {pending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </CrmModal>
    </>
  )
}

