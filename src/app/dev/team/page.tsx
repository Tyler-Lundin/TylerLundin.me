import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { Users, Mail, Shield } from 'lucide-react'
import TeamManager from '@/components/dev/team/TeamManager'

export const dynamic = 'force-dynamic'

async function fetchInvites() {
  const sb: any = await createServiceClient()
  const { data, error } = await sb
    .from('team_invites')
    .select('id, email, role, status, created_at, expires_at, accepted_at, message')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) return []
  return Array.isArray(data) ? data : []
}

async function fetchMembers() {
  const sb: any = await createServiceClient()

  // Fetch users first - filter out non-team roles (guest, client)
  const { data: users, error: usersError } = await sb
    .from('users')
    .select('id, email, full_name, role, created_at')
    .not('role', 'in', '("guest","client")')
    .order('created_at', { ascending: false })

  if (usersError) {
    console.error('Error fetching members:', usersError?.message || usersError)
    return []
  }

  const list = Array.isArray(users) ? users : []
  const ids = list.map((u: any) => u.id)
  if (ids.length === 0) return []

  // Fetch profiles separately (no FK embedding required)
  const { data: profiles, error: profErr } = await sb
    .from('user_profiles')
    .select('user_id, avatar_url')
    .in('user_id', ids)

  if (profErr) {
    console.error('Error fetching profiles:', profErr?.message || profErr)
  }

  const profById: Record<string, any> = {}
  for (const p of profiles || []) profById[p.user_id] = p

  return list.map((u: any) => ({
    ...u,
    avatar_url: profById[u.id]?.avatar_url || null,
  }))
}

function KpiCard({ title, value, icon }: { title: string, value: string | number, icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{title}</span>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</div>
      </div>
    </div>
  )
}

export default async function TeamIndex() {
  const [invites, members, currentUser] = await Promise.all([
    fetchInvites(),
    fetchMembers(),
    getAuthUser()
  ])
  
  const pendingCount = invites.filter((i: any) => i.status === 'pending').length
  const adminCount = members.filter((m: any) => m.role === 'admin').length

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Team Management</h1>
          <p className="text-sm text-neutral-500">Manage access, roles, and invitations</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Active Members" value={members.length} icon={<Users className="h-5 w-5 text-neutral-400" />} />
          <KpiCard title="Pending Invites" value={pendingCount} icon={<Mail className="h-5 w-5 text-neutral-400" />} />
          <KpiCard title="Admins" value={adminCount} icon={<Shield className="h-5 w-5 text-amber-500" />} />
          <KpiCard title="Total Seats" value="Unlimited" icon={<span className="flex size-2 rounded-full bg-emerald-500" />} />
        </div>

        {/* Main Content */}
        <TeamManager members={members} invites={invites} currentUser={currentUser} />

      </div>
    </div>
  )
}
