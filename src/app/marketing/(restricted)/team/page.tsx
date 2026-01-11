import { requireRoles, getAuthUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import MarketingTeamManager from '@/components/marketing/MarketingTeamManager'

export default async function MarketingTeamPage() {
  // Only Head of Marketing and Admin may manage marketing team
  await requireRoles(['admin', 'head_of_marketing', 'head of marketing'])

  let sb: any
  try { sb = getSupabaseAdmin() } catch { sb = null }
  const me = await getAuthUser()

  // Fetch marketing-role users
  const { data: users } = sb ? await sb
    .from('users')
    .select('id, email, full_name, role, created_at')
    .in('role', ['marketing_editor', 'marketing_analyst', 'head_of_marketing'])
    .order('created_at', { ascending: false }) : { data: [] }

  const ids = (users || []).map((u: any) => u.id)
  const { data: profiles } = sb ? await sb
    .from('user_profiles')
    .select('user_id, avatar_url')
    .in('user_id', ids) : { data: [] }

  const profById: Record<string, any> = {}
  for (const p of profiles || []) profById[p.user_id] = p

  const members = (users || []).map((u: any) => ({
    ...u,
    avatar_url: profById[u.id]?.avatar_url || null,
  }))

  // Recent invites (marketing roles only)
  const { data: invites } = sb ? await sb
    .from('team_invites')
    .select('*')
    .in('role', ['marketing_editor', 'marketing_analyst'])
    .order('created_at', { ascending: false })
    .limit(20) : { data: [] }

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MarketingTeamManager members={members} invites={invites || []} currentUser={me} />
      </div>
    </div>
  )
}
