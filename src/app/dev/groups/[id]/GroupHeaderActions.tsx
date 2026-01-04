"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GroupHeaderActions({ group }: { group: { id: string; name: string; description?: string | null } }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description || '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function save() {
    try {
      setSaving(true)
      setErr(null)
      const res = await fetch(`/api/dev/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description }),
      })
      const data = await res.json()
      if (!res.ok || data?.error) throw new Error(data?.error || 'Update failed')
      setEditing(false)
      router.refresh()
    } catch (e: any) {
      setErr(e?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  async function removeGroup() {
    if (!confirm('Delete this group? This removes only the group, not the leads.')) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/dev/groups/${group.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || data?.error) throw new Error(data?.error || 'Delete failed')
      // Back to groups list
      window.location.href = '/dev/leads'
    } catch (e: any) {
      setErr(e?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            className="h-8 rounded border px-2 text-sm"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="h-8 w-64 rounded border px-2 text-sm"
          />
          <button disabled={saving} onClick={save} className="h-8 rounded bg-blue-600 px-3 text-sm font-medium text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => setEditing(false)} className="h-8 rounded border px-3 text-sm">Cancel</button>
          {err && <span className="text-xs text-red-600">{err}</span>}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(true)} className="h-8 rounded border px-3 text-sm">Rename/Edit</button>
          <button onClick={removeGroup} disabled={deleting} className="h-8 rounded border px-3 text-sm text-red-600 disabled:opacity-60">{deleting ? 'Deleting…' : 'Delete'}</button>
        </div>
      )}
    </div>
  )
}

