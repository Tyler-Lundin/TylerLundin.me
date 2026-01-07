'use client'

import { useState, useRef } from 'react'
import { Users, Mail, Plus, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { updateUserRole, inviteUser, deleteUser } from '@/app/dev/team/actions'
import InviteManager from '@/components/dev/team/InviteManager'

export default function TeamManager({ members, invites, currentUser }: any) {
  const [tab, setTab] = useState<'members' | 'invites'>('members')
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg self-start">
          <button
            onClick={() => setTab('members')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'members'
                ? 'bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setTab('invites')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'invites'
                ? 'bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Pending Invites ({invites.length})
          </button>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {tab === 'members' ? (
          <MembersList members={members} currentUser={currentUser} />
        ) : (
          <div className="p-0">
             <InviteManager initialInvites={invites} />
          </div>
        )}
      </div>

      {isInviteOpen && <InviteModal onClose={() => setIsInviteOpen(false)} />}
    </div>
  )
}

function formatRole(role: string) {
  if (!role) return 'Member'
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

function MembersList({ members, currentUser }: { members: any[], currentUser: any }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [menu, setMenu] = useState<{ x: number, y: number, memberId: string } | null>(null)
  const touchRef = useRef<NodeJS.Timeout>(null)

  const handleContextMenu = (e: React.MouseEvent, memberId: string) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, memberId })
  }

  const handleTouchStart = (e: React.TouchEvent, memberId: string) => {
    const touch = e.touches[0]
    const { clientX, clientY } = touch
    touchRef.current = setTimeout(() => {
      setMenu({ x: clientX, y: clientY, memberId })
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (touchRef.current) clearTimeout(touchRef.current)
  }

  const handleDelete = async (id: string, name: string) => {
     const ok = window.confirm(`Delete ${name}? This cannot be undone.`)
     if (!ok) return
     setDeletingId(id)
     const res = await deleteUser(id)
     setDeletingId(null)
     if ((res as any)?.error) {
       alert(`Failed to delete: ${(res as any).error}`)
     } else {
       window.location.reload()
     }
  }

  return (
    <div className="overflow-x-auto min-h-[300px]" onClick={() => setMenu(null)}>
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
          <tr>
            <th className="px-6 py-3 font-medium">Member</th>
            <th className="px-6 py-3 font-medium">Role</th>
            <th className="px-6 py-3 font-medium text-right">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {members.map((member) => (
            <tr 
              key={member.id} 
              className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors select-none cursor-context-menu"
              onContextMenu={(e) => handleContextMenu(e, member.id)}
              onTouchStart={(e) => handleTouchStart(e, member.id)}
              onTouchEnd={handleTouchEnd}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700">
                     {member.avatar_url ? (
                        <img src={member.avatar_url} alt="" className="h-full w-full object-cover" />
                     ) : (
                        <div className="h-full w-full flex items-center justify-center text-neutral-400 font-bold bg-neutral-200 dark:bg-neutral-800">
                           {member.full_name?.[0] || '?'}
                        </div>
                     )}
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-white">
                      {member.full_name || 'Unknown User'}
                      {currentUser?.id === member.id && <span className="ml-2 text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">You</span>}
                    </div>
                    <div className="text-xs text-neutral-500">{member.email || 'No email'}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {editingId === member.id ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <RoleEditor 
                      userId={member.id} 
                      currentRole={member.role} 
                      onClose={() => setEditingId(null)} 
                    />
                  </div>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${member.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}
                  `}>
                    {formatRole(member.role)}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right text-neutral-500">
                {member.created_at ? new Date(member.created_at).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
          {members.length === 0 && (
             <tr>
               <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">No members found.</td>
             </tr>
          )}
        </tbody>
      </table>

      {menu && (
        <div className="fixed inset-0 z-[100] flex" onClick={() => setMenu(null)} onContextMenu={(e) => e.preventDefault()}>
          <div 
            className="absolute bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl min-w-[160px] py-1 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
            style={{ top: Math.min(menu.y, window.innerHeight - 100), left: Math.min(menu.x, window.innerWidth - 180) }}
          >
            <button 
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors flex items-center gap-2"
              onClick={() => {
                 setEditingId(menu.memberId)
                 setMenu(null)
              }}
            >
              <Users className="w-4 h-4 text-neutral-400" />
              Edit Role
            </button>
            <button 
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 transition-colors flex items-center gap-2"
              onClick={() => {
                 const m = members.find(m => m.id === menu.memberId)
                 handleDelete(menu.memberId, m?.full_name || m?.email || 'this user')
                 setMenu(null)
              }}
            >
              <X className="w-4 h-4" />
              Delete Member
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleEditor({ userId, currentRole, onClose }: { userId: string, currentRole: string, onClose: () => void }) {
   const [role, setRole] = useState(currentRole || 'member')
   const [saving, setSaving] = useState(false)

   const handleSave = async () => {
      setSaving(true)
      await updateUserRole(userId, role)
      setSaving(false)
      onClose()
   }

   return (
      <div className="flex items-center gap-2">
         <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            disabled={saving}
            className="text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
         >
            <option value="member">Member</option>
            <option value="marketing_editor">Marketing Editor</option>
            <option value="marketing_analyst">Marketing Analyst</option>
            <option value="head_of_marketing">Head of Marketing</option>
            <option value="admin">Admin</option>
         </select>
         <button onClick={handleSave} disabled={saving} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
            <CheckCircle className="w-4 h-4" />
         </button>
         <button onClick={onClose} disabled={saving} className="p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
            <X className="w-4 h-4" />
         </button>
      </div>
   )
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  async function handleSubmit(formData: FormData) {
     setPending(true)
     setError(null)
     const res = await inviteUser(null, formData)
     setPending(false)
     if (res?.error) {
        setError(res.error)
     } else {
        onClose()
     }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Invite New Member</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"><X className="w-5 h-5" /></button>
        </div>
        
        <form action={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Email Address</label>
            <input name="email" type="email" required placeholder="colleague@example.com" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Role</label>
            <select name="role" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="member">Member</option>
              <option value="marketing_editor">Marketing Editor</option>
              <option value="marketing_analyst">Marketing Analyst</option>
              <option value="head_of_marketing">Head of Marketing</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Message (Optional)</label>
            <textarea name="inviteMessage" rows={3} placeholder="Welcome to the team!" className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && (
             <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/10 dark:text-rose-400">
               <AlertCircle className="h-4 w-4" />
               {error}
             </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-lg">Cancel</button>
            <button type="submit" disabled={pending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2 shadow-sm">
               {pending && <Loader2 className="w-4 h-4 animate-spin" />}
               Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
