"use client"

import { useMemo, useState } from 'react'

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
    <div className="rounded-lg border border-[#3F4147] bg-[#1E1F22] overflow-hidden">
      <div className="p-3 border-b border-[#2a2b30] text-sm font-medium text-white">Recent Invites</div>
      <ul>
        {sorted.map((i) => (
          <li
            key={i.id}
            className="flex items-center justify-between gap-3 p-3 border-b border-[#1F2124] text-sm hover:bg-[#232428] cursor-pointer"
            onClick={() => setSelected(i)}
          >
            <div className="min-w-0">
              <div className="font-medium text-white truncate">{i.email}</div>
              <div className="text-[11px] text-[#949BA4]">Role: {i.role} • Status: {i.status}</div>
            </div>
            <div className="text-[11px] text-[#949BA4] shrink-0">
              {i.created_at && new Date(i.created_at).toLocaleDateString()}
            </div>
          </li>
        ))}
        {sorted.length === 0 && <li className="p-3 text-sm text-[#949BA4]">No invites yet.</li>}
      </ul>

      {open && selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[#3F4147] bg-[#1E1F22] shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-[#2a2b30]">
                <div className="text-white font-medium text-sm">Edit Invite</div>
                <button className="text-[#B5BAC1] hover:text-white" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#949BA4] mb-1">Email</label>
                    <input
                      className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]"
                      value={selected.email}
                      onChange={(e) => setSelected({ ...selected, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#949BA4] mb-1">Role</label>
                    <select
                      className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]"
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
                  <label className="block text-[11px] text-[#949BA4] mb-1">Message</label>
                  <textarea
                    rows={4}
                    className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]"
                    value={selected.message || ''}
                    onChange={(e) => setSelected({ ...selected, message: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#949BA4] mb-1">Status</label>
                    <select
                      className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]"
                      value={selected.status}
                      onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                    >
                      <option value="pending">pending</option>
                      <option value="accepted">accepted</option>
                      <option value="expired">expired</option>
                      <option value="revoked">revoked</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#949BA4] mb-1">Expires At</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#DBDEE1]"
                      value={toLocalDateInput(selected.expires_at)}
                      onChange={(e) => setSelected({ ...selected, expires_at: fromLocalDateInput(e.target.value) })}
                    />
                  </div>
                </div>
                {error && <div className="text-red-400 text-xs">{error}</div>}
              </div>
              <div className="p-4 border-t border-[#2a2b30] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded bg-[#5865F2] text-white text-sm disabled:opacity-60"
                    disabled={saving}
                    onClick={() => updateInvite({
                      email: selected.email,
                      role: selected.role,
                      message: selected.message || '',
                      status: selected.status,
                      expires_at: selected.expires_at || null,
                    })}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    className="px-3 py-2 rounded bg-[#383A40] text-[#DBDEE1] text-sm disabled:opacity-60"
                    disabled={sending}
                    onClick={resendInvite}
                  >
                    {sending ? 'Sending…' : 'Resend'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded bg-[#3a2020] text-red-200 text-sm"
                    onClick={() => updateInvite({ status: 'revoked' })}
                  >
                    Revoke
                  </button>
                  <button
                    className="px-3 py-2 rounded bg-[#5a1a1a] text-white text-sm disabled:opacity-60"
                    disabled={deleting}
                    onClick={deleteInvite}
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
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

