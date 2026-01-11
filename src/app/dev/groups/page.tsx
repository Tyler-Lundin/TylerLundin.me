import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

async function fetchGroups() {
  try {
    const sb = getSupabaseAdmin()
    const [{ data: groups }, { data: members }] = await Promise.all([
      sb.from('lead_groups').select('id,name,description,created_at').order('created_at', { ascending: false }),
      sb.from('lead_group_members').select('group_id').limit(10000),
    ])
    const counts = new Map<string, number>()
    ;(members || []).forEach((m: any) => counts.set(m.group_id, (counts.get(m.group_id) || 0) + 1))
    return (groups || []).map((g: any) => ({ ...g, lead_count: counts.get(g.id) || 0 }))
  } catch (e) {
    // If not configured, return empty list
    return [] as any[]
  }
}

export default async function GroupsIndexPage(props: any) {
  const basePath = typeof props?.basePath === 'string' ? props.basePath : '/dev'
  const groups = await fetchGroups()

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Groups</h1>
          <CreateGroupClient />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="w-3/6 px-4 py-2 text-left">Name</th>
                  <th className="w-2/6 px-4 py-2 text-left">Description</th>
                  <th className="w-1/6 px-4 py-2 text-left">Leads</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id} className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-900 dark:even:bg-neutral-950">
                    <td className="px-4 py-2">
                      <Link href={`${basePath}/groups/${g.id}`} className="font-medium text-blue-600 underline">{g.name}</Link>
                      <div className="text-xs text-neutral-500">{new Date(g.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-2 text-neutral-600 dark:text-neutral-400">
                      <div className="truncate max-w-[520px]">{g.description || '—'}</div>
                    </td>
                    <td className="px-4 py-2">{g.lead_count}</td>
                  </tr>
                ))}
                {groups.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-neutral-500">No groups yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateGroupClient() {
  return (
    <form
      action={async (formData: FormData) => {
        'use server'
        const sb = getSupabaseAdmin()
        const name = String(formData.get('name') || '').trim()
        const description = String(formData.get('description') || '').trim()
        if (!name) return
        await sb.from('lead_groups').insert({ name, description: description || null })
      }}
      className="flex items-center gap-2"
    >
      <input name="name" placeholder="New group name" className="h-9 w-48 rounded border px-2 text-sm" />
      <input name="description" placeholder="Description (optional)" className="h-9 w-64 rounded border px-2 text-sm" />
      <button type="submit" className="h-9 rounded bg-neutral-900 px-3 text-xs font-medium text-white dark:bg-white dark:text-neutral-900">Create</button>
    </form>
  )
}
