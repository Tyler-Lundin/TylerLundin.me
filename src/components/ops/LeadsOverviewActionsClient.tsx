"use client"
import { useEffect, useRef, useState, useTransition } from 'react'

function DotsIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6-2a2 2 0 100 4 2 2 0 000-4zm6 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

export default function LeadsOverviewActionsClient() {
  const [open, setOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [cleaning, startCleaning] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  async function runClean() {
    setMsg(null)
    startCleaning(async () => {
      try {
        const res = await fetch('/api/dev/leads/clean', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deleteConvertedInGroups: true, dryRun: false }),
        })
        const data = await res.json()
        if (!res.ok || data?.error) throw new Error(data?.error || 'Clean failed')
        setMsg(`Deleted ${data.deleted} (Ungrouped: ${data.ungrouped}, Converted: ${data.converted})`)
      } catch (e: any) {
        setMsg(e?.message || 'Clean failed')
      } finally {
        setShowConfirm(false)
        setOpen(false)
      }
      // Refresh the page data
      if (typeof window !== 'undefined') window.location.reload()
    })
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="inline-flex items-center justify-center rounded border px-2 py-1 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800"
        onClick={() => setOpen((v) => !v)}
        disabled={cleaning}
        aria-haspopup="menu"
        aria-expanded={open}
        title="More actions"
      >
        <DotsIcon />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-md border bg-white text-sm shadow-md dark:border-neutral-800 dark:bg-neutral-900">
          <button
            className="block w-full px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
            onClick={() => { setShowConfirm(true); setOpen(false) }}
          >
            Clean Leads…
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowConfirm(false)} />
          <div className="absolute inset-0 z-50 grid place-items-center p-4">
            <div className="w-full max-w-sm rounded-lg border bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <h4 className="mb-2 text-sm font-semibold">Clean Leads</h4>
              <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-300">
                Deletes ungrouped leads. Also deletes any leads that have been converted to a client/project.
              </p>
              <div className="mb-3 rounded bg-neutral-50 p-2 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                This action cannot be undone.
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button className="rounded border px-3 py-1.5 text-sm" onClick={() => setShowConfirm(false)} disabled={cleaning}>Cancel</button>
                <button className="rounded bg-rose-600 px-3 py-1.5 text-sm text-white disabled:opacity-50" onClick={runClean} disabled={cleaning}>
                  {cleaning ? 'Cleaning…' : 'Clean now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

