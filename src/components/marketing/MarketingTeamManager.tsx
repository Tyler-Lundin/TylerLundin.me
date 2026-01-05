"use client"

import { useState } from 'react'
import { updateMarketingUserRole, inviteMarketingUser } from '@/app/marketing/team/actions'

export default function MarketingTeamManager({ members, invites, currentUser }: any) {
  const [tab, setTab] = useState<'members' | 'invites'>('members')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg self-start">
          <button onClick={() => setTab('members')} className={`px-4 py-2 text-sm font-medium rounded-md ${tab==='members'?'bg-white dark:bg-neutral-900 shadow-sm':''}`}>Members</button>
          <button onClick={() => setTab('invites')} className={`px-4 py-2 text-sm font-medium rounded-md ${tab==='invites'?'bg-white dark:bg-neutral-900 shadow-sm':''}`}>Invites ({invites.length})</button>
        </div>
        <button onClick={() => setIsInviteOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Invite Marketing</button>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {tab==='members' ? (
          <MembersList members={members} currentUser={currentUser} />
        ) : (
          <InvitesList invites={invites} />
        )}
      </div>
      {isInviteOpen && <InviteModal onClose={() => setIsInviteOpen(false)} />}
    </div>
  )
}

function MembersList({ members, currentUser }: { members: any[], currentUser: any }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
          <tr>
            <th className="px-6 py-3 font-medium">Member</th>
            <th className="px-6 py-3 font-medium">Role</th>
            <th className="px-6 py-3 font-medium">Joined</th>
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {members.map((m) => (
            <tr key={m.id}>
              <td className="px-6 py-4">
                <div className="font-medium">{m.full_name || 'Unknown'}{currentUser?.id===m.id && <span className="ml-2 text-xs text-blue-500">You</span>}</div>
                <div className="text-xs text-neutral-500">{m.email}</div>
              </td>
              <td className="px-6 py-4">
                {editingId===m.id ? (
                  <RoleEditor userId={m.id} currentRole={m.role} onClose={()=>setEditingId(null)} />
                ) : (
                  <span className="text-xs capitalize">{m.role?.replace(/_/g,' ')}</span>
                )}
              </td>
              <td className="px-6 py-4 text-neutral-500">{m.created_at? new Date(m.created_at).toLocaleDateString(): '-'}</td>
              <td className="px-6 py-4 text-right">
                {editingId!==m.id && (
                  <button onClick={()=>setEditingId(m.id)} className="text-sm text-blue-600">Edit</button>
                )}
              </td>
            </tr>
          ))}
          {members.length===0 && (
            <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No marketing members found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function RoleEditor({ userId, currentRole, onClose }: { userId: string, currentRole: string, onClose: ()=>void }) {
  const [role, setRole] = useState(currentRole || 'marketing_editor')
  const [saving, setSaving] = useState(false)
  async function handleSave() {
    setSaving(true)
    const res = await updateMarketingUserRole(userId, role)
    setSaving(false)
    if ((res as any)?.error) alert((res as any).error); else onClose();
    if (!(res as any)?.error) window.location.reload()
  }
  return (
    <div className="flex items-center gap-2">
      <select value={role} onChange={(e)=>setRole(e.target.value)} disabled={saving} className="text-xs rounded border px-2 py-1">
        <option value="marketing_editor">Marketing Editor</option>
        <option value="marketing_analyst">Marketing Analyst</option>
      </select>
      <button onClick={handleSave} disabled={saving} className="text-green-600">Save</button>
      <button onClick={onClose} disabled={saving} className="text-neutral-500">Cancel</button>
    </div>
  )
}

function InvitesList({ invites }: { invites: any[] }) {
  return (
    <div>
      <div className="border-b border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Recent Marketing Invites</h3>
      </div>
      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {invites.map((i) => (
          <li key={i.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{i.email}</div>
              <div className="text-xs text-neutral-500">{i.role} • {i.status}</div>
            </div>
            <div className="text-xs text-neutral-400">{i.created_at && new Date(i.created_at).toLocaleDateString()}</div>
          </li>
        ))}
        {invites.length===0 && <li className="p-8 text-center text-neutral-500">No invites.</li>}
      </ul>
    </div>
  )
}

function InviteModal({ onClose }: { onClose: ()=>void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string|null>(null)
  async function handleSubmit(formData: FormData) {
    setPending(true); setError(null)
    const res = await inviteMarketingUser(formData)
    setPending(false)
    if ((res as any)?.error) setError((res as any).error); else onClose();
    if (!(res as any)?.error) window.location.reload()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="font-semibold text-lg">Invite Marketing Member</h3>
          <button onClick={onClose} className="text-neutral-400">×</button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Email Address</label>
            <input name="email" type="email" required placeholder="person@example.com" className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Role</label>
            <select name="role" className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value="marketing_editor">Marketing Editor</option>
              <option value="marketing_analyst">Marketing Analyst</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Message (Optional)</label>
            <textarea name="inviteMessage" rows={3} placeholder="Welcome to the marketing team!" className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded border px-3 py-1.5 text-sm">Cancel</button>
            <button disabled={pending} className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50">{pending ? 'Sending…' : 'Send Invite'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

