"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Building2, ExternalLink, Calendar, Trash2, X, AlertTriangle } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { deleteClientAction } from '@/app/dev/actions/crm'

interface Client {
  id: string
  name: string
  company?: string | null
  website_url?: string | null
  created_at: string
}

export default function ClientsTable({ initialClients }: { initialClients: Client[] }) {
  const [menu, setMenu] = useState<{ x: number, y: number, clientId: string, clientName: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleContextMenu = (e: React.MouseEvent, client: Client) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, clientId: client.id, clientName: client.name })
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setIsDeleting(true)
    const formData = new FormData()
    formData.append('id', confirmDelete.id)
    await deleteClientAction(null, formData)
    setIsDeleting(false)
    setConfirmDelete(null)
    window.location.reload() // Quickest way to refresh since it's a server page update
  }

  // Close menu on click outside
  useEffect(() => {
    const handleClick = () => setMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          <tr>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Company</th>
            <th className="px-6 py-3 font-medium">Website</th>
            <th className="px-6 py-3 font-medium text-right">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {initialClients.map((c) => (
            <tr 
              key={c.id} 
              className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-context-menu"
              onContextMenu={(e) => handleContextMenu(e, c)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <Link className="font-medium text-neutral-900 hover:underline dark:text-white" href={`/dev/clients/${slugify(c.name)}`}>
                    {c.name}
                  </Link>
                </div>
              </td>
              <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{c.company || '—'}</td>
              <td className="px-6 py-4">
                {c.website_url ? (
                  <a href={c.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400">
                    {new URL(c.website_url).hostname}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-right text-xs text-neutral-500 tabular-nums">
                <div className="flex items-center justify-end gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
              </td>
            </tr>
          ))}
          {initialClients.length === 0 && (
            <tr>
              <td colSpan={4} className="p-8 text-center text-neutral-500">No clients found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Context Menu */}
      {menu && (
        <div 
          className="fixed z-[1000] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-2"
            onClick={() => {
              setConfirmDelete({ id: menu.clientId, name: menu.clientName })
              setMenu(null)
            }}
          >
            <Trash2 className="size-4" />
            Delete Client
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 text-rose-600 mb-4">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                  <AlertTriangle className="size-6" />
                </div>
                <h3 className="text-xl font-bold">Delete Client?</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This will also remove all associated projects, tasks, and data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}
