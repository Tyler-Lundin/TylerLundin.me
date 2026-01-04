"use client"
import { useEffect, useState } from 'react'

export default function LeadDetailBackConfirm() {
  const [open, setOpen] = useState(false)
  const [navigating, setNavigating] = useState(false)

  // Global Escape to open back confirm, unless another dialog is open or user is typing
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      const t = e.target as HTMLElement | null
      const tag = (t?.tagName || '').toLowerCase()
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (t?.isContentEditable ?? false)
      if (isTyping) return
      // Don't open if another dialog exists
      if (document.querySelector('[role="dialog"]')) return
      e.preventDefault()
      setOpen(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // While confirm open, Enter confirms; Esc cancels
  useEffect(() => {
    if (!open) return
    function onConfirmKeys(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault()
        void goBack()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onConfirmKeys)
    return () => document.removeEventListener('keydown', onConfirmKeys)
  }, [open])

  async function goBack() {
    try {
      setNavigating(true)
      if (window.history.length > 1) window.history.back()
      else window.location.href = '/dev/leads'
    } finally {
      setNavigating(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 z-[91] bg-black/30 backdrop-blur-sm sm:backdrop-blur" onClick={() => setOpen(false)} />
      <div className="absolute inset-0 z-[92] grid place-items-center p-4">
        <div role="dialog" aria-modal="true" aria-labelledby="go-back-title" className="w-full max-w-sm rounded-lg border bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <h4 id="go-back-title" className="mb-2 text-sm font-semibold">Go Back?</h4>
          <p className="mb-3 text-sm text-neutral-700 dark:text-neutral-300">
            Do you want to return to the previous page?
          </p>
          <div className="mb-3 rounded bg-neutral-50 p-2 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            Press Enter to confirm, or Esc to cancel.
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button className="rounded border px-3 py-1.5 text-sm" onClick={() => setOpen(false)} disabled={navigating}>Cancel (Esc)</button>
            <button className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50" onClick={goBack} disabled={navigating}>
              {navigating ? 'Going…' : 'Go Back (Enter)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
