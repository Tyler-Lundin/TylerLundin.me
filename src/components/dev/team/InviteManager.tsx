"use client"

import { useMemo, useState } from 'react'
import { MoreHorizontal, X, User, Shield, AlertCircle, CheckCircle } from 'lucide-react'

type Invite = {
  id: string
  email: string
  role: string
  message?: string | null
  status: string
  created_at?: string | null
  expires_at?: string | null
  accepted_at?: string | null
}

function formatRole(role: string) {
  if (!role) return 'Member'
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

export default function InviteManager({ initialInvites }: { initialInvites: Invite[] }) {
  const [invites, setInvites] = useState<Invite[]>(initialInvites || [])
  const [selected, setSelected] = useState<Invite | null>(null)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = Boolean(selected)
  const sorted = useMemo(() => invites.slice().sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')), [invites])

  async function updateInvite(fields: Partial<Invite>) {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/team/invites/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.message || 'Update failed')
      const updated: Invite = data.invite
      setInvites((list) => list.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
      setSelected((cur) => (cur ? { ...cur, ...updated } : cur))
    } catch (e: any) {
      setError(e?.message || 'Failed to update invite')
    } finally {
      setSaving(false)
    }
  }

  async function resendInvite() {
    if (!selected) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/team/invites/${selected.id}/resend`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.message || 'Resend failed')
      const updated: Invite = data.invite
      setInvites((list) => list.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
      setSelected((cur) => (cur ? { ...cur, ...updated } : cur))
    } catch (e: any) {
      setError(e?.message || 'Failed to resend')
    } finally {
      setSending(false)
    }
  }

  async function deleteInvite() {
    if (!selected) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/team/invites/${selected.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.message || 'Delete failed')
      setInvites((list) => list.filter((i) => i.id !== selected.id))
      setSelected(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="border-b border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Recent Invites</h3>
      </div>
      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {sorted.map((i) => (
          <li
            key={i.id}
            className="flex cursor-pointer items-center justify-between gap-3 p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            onClick={() => setSelected(i)}
          >
            <div className="flex items-center gap-3 min-w-0">
               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  <User className="h-4 w-4" />
               </div>
               <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-neutral-900 dark:text-white">{i.email}</div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                     <span>{formatRole(i.role)}</span>
                     <span>•</span>
                     <span className={`capitalize ${i.status === 'pending' ? 'text-amber-600 dark:text-amber-500' : 'text-neutral-500'}`}>{i.status}</span>
                  </div>
               </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs text-neutral-400">{i.created_at && new Date(i.created_at).toLocaleDateString()}</div>
            </div>
          </li>
        ))}
        {sorted.length === 0 && (
          <li className="p-8 text-center text-sm text-neutral-500">No active invitations found.</li>
        )}
      </ul>

      {open && selected && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm dark:bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Manage Invitation</h3>
              <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200" onClick={() => setSelected(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">Email Address</label>
                  <input
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
                    value={selected.email}
                    onChange={(e) => setSelected({ ...selected, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">Role</label>
                  <select
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
                    value={selected.role}
                    onChange={(e) => setSelected({ ...selected, role: e.target.value })}
                  >
                    <option value="member">Member</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-500">Invitation Message</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
                  value={selected.message || ''}
                  onChange={(e) => setSelected({ ...selected, message: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">Status</label>
                  <select
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
                    value={selected.status}
                    onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-500">Expires At</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
                    value={toLocalDateInput(selected.expires_at)}
                    onChange={(e) => setSelected({ ...selected, expires_at: fromLocalDateInput(e.target.value) })}
                  />
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/10 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  disabled={saving}
                  onClick={() => updateInvite({
                    email: selected.email,
                    role: selected.role,
                    message: selected.message || '',
                    status: selected.status,
                    expires_at: selected.expires_at || null,
                  })}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  disabled={sending}
                  onClick={resendInvite}
                >
                  {sending ? 'Sending...' : 'Resend Invite'}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                  disabled={deleting}
                  onClick={deleteInvite}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function toLocalDateInput(iso?: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const tzOffset = d.getTimezoneOffset() * 60000
    const local = new Date(d.getTime() - tzOffset)
    return local.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

function fromLocalDateInput(v?: string | null): string | null {
  if (!v) return null
  try {
    const d = new Date(v)
    return new Date(d.getTime()).toISOString()
  } catch {
    return null
  }
}


