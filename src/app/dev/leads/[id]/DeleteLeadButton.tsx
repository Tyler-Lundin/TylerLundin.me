"use client"
import { useEffect, useState } from 'react'

export default function DeleteLeadButton({ leadId, hasClientOrProject }: { leadId: string; hasClientOrProject?: boolean }) {
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  // Global Delete key to open confirm (unless typing in an input/textarea)
  useEffect(() => {
    function onGlobalKey(e: KeyboardEvent) {
      // On macOS, the "Delete" key is reported as 'Backspace' on most keyboards
      const isDeleteKey = e.key === 'Delete' || e.key === 'Backspace'
      if (!isDeleteKey) return
      const t = e.target as HTMLElement | null
      const tag = (t?.tagName || '').toLowerCase()
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (t?.isContentEditable ?? false)
      if (isTyping) return
      // Don't fire if any modal/dialog is already open
      if (document.querySelector('[role="dialog"]')) return
      if (showConfirm || deleting) return
      e.preventDefault()
      setShowConfirm(true)
    }
    document.addEventListener('keydown', onGlobalKey)
    return () => document.removeEventListener('keydown', onGlobalKey)
  }, [showConfirm, deleting])

  useEffect(() => {
    if (!showConfirm) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowConfirm(false)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        void confirmDelete()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showConfirm])

  async function confirmDelete() {
    try {
      setDeleting(true)
      setErr(null)
      const res = await fetch(`/api/dev/leads/${leadId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.error) throw new Error(data?.error || 'Failed to delete')
      window.location.href = '/dev/leads'
    } catch (e: any) {
      setErr(e?.message || 'Failed to delete')
      setShowConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setShowConfirm(true)} disabled={deleting} className="h-8 rounded border px-3 text-sm text-red-600 disabled:opacity-60">
        {deleting ? 'Deleting…' : 'Delete Lead'}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}

      {showConfirm && (
        <div className="fixed inset-0 z-[90]">
          <div className="absolute inset-0 z-[91] bg-black/30 backdrop-blur-sm sm:backdrop-blur" onClick={() => setShowConfirm(false)} />
          <div className="absolute inset-0 z-[92] grid place-items-center p-4">
            <div role="dialog" aria-modal="true" aria-labelledby="delete-lead-title" className="w-full max-w-sm rounded-lg border bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <h4 id="delete-lead-title" className="mb-2 text-sm font-semibold">Delete Lead</h4>
              <p className="mb-3 text-sm text-neutral-700 dark:text-neutral-300">
                This action will permanently delete the lead and remove it from all groups.
                {hasClientOrProject ? (
                  <>
                    {' '}This lead is linked to a client or project. Those are not deleted, but links will be orphaned.
                  </>
                ) : null}
              </p>
              <div className="mb-3 rounded bg-neutral-50 p-2 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                Press Enter to confirm, or Esc to cancel.
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button className="rounded border px-3 py-1.5 text-sm" onClick={() => setShowConfirm(false)} disabled={deleting}>Cancel (Esc)</button>
                <button className="rounded bg-rose-600 px-3 py-1.5 text-sm text-white disabled:opacity-50" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete (Enter)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
