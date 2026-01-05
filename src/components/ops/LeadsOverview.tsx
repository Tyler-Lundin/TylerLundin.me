import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth'
import LeadsOverviewActionsClient from '@/components/ops/LeadsOverviewActionsClient'

type RankedGroup = {
  group_id: string
  name: string
  lead_count: number
  score: number
}

function scoreForReviews(total: number | null | undefined): number {
  if (!total || total <= 0) return 0.5
  if (total >= 1 && total <= 20) return 3
  if (total >= 21 && total <= 50) return 2
  return 0.5
}

export default async function LeadsOverview() {
  // Use service client to bypass RLS for admin dashboard KPIs
  const sb = await createServiceClient()
  const role = await getUserRole()
  const base = role === 'admin' ? '/dev' : ((role === 'head_of_marketing' || role === 'head of marketing') ? '/marketing' : '/dev')

  // Basic metrics
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const [leadsTotalRes, leadsWebYesRes, leadsWebNoRes, leadsTodayRes, groupsRes, groupMembersRes] = await Promise.all([
    sb.from('leads').select('id', { count: 'exact', head: true }),
    sb.from('leads').select('id', { count: 'exact', head: true }).not('website', 'is', null),
    sb.from('leads').select('id', { count: 'exact', head: true }).is('website', null),
    sb.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', since),
    sb.from('lead_groups').select('id,name').order('created_at', { ascending: false }),
    sb.from('lead_group_members').select('group_id, leads(id,user_ratings_total)').limit(10000),
  ])

  const groups = new Map<string, { name: string }>()
  ;(groupsRes.data || []).forEach((g: any) => groups.set(g.id, { name: g.name }))
  const agg = new Map<string, { name: string; lead_count: number; sumScore: number }>()
  ;(groupMembersRes.data || []).forEach((row: any) => {
    const gid: string = row.group_id
    const name = groups.get(gid)?.name || 'Group'
    const total = row.leads?.user_ratings_total as number | null
    const s = scoreForReviews(typeof total === 'number' ? total : null)
    const entry = agg.get(gid) || { name, lead_count: 0, sumScore: 0 }
    entry.lead_count += 1
    entry.sumScore += s
    agg.set(gid, entry)
  })

  const ranked: RankedGroup[] = Array.from(agg.entries()).map(([group_id, v]) => ({
    group_id,
    name: v.name,
    lead_count: v.lead_count,
    score: v.lead_count > 0 ? v.sumScore / v.lead_count : 0,
  }))
  ranked.sort((a, b) => b.score - a.score || b.lead_count - a.lead_count)

  return (
    <section className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Leads Overview</h2>
        <div className="flex items-center gap-2">
          <Link href={`${base}/leads`} className="rounded border px-2 py-1 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">Open Lead Generator</Link>
          <Link href={`${base}/leads/swipe`} className="rounded border px-2 py-1 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">Open Swipe</Link>
          <LeadsOverviewActionsClient />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 px-6 py-4 sm:grid-cols-4">
        <Kpi label="Total Leads" value={leadsTotalRes.count || 0} />
        <Kpi label="With Website" value={leadsWebYesRes.count || 0} subtle={`${Math.round(((leadsWebYesRes.count || 0)/Math.max(1,(leadsTotalRes.count || 0)))*100)}%`} />
        <Kpi label="No Website" value={leadsWebNoRes.count || 0} subtle={`${Math.round(((leadsWebNoRes.count || 0)/Math.max(1,(leadsTotalRes.count || 0)))*100)}%`} />
        <Kpi label="Last 24h" value={leadsTodayRes.count || 0} />
      </div>

      {/* Top Groups */}
      <div className="border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">
        <div className="mb-2 text-sm font-medium">Top Groups</div>
        {ranked.length === 0 ? (
          <div className="text-sm text-neutral-500">No groups yet.</div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ranked.slice(0, 6).map((g) => (
              <Link key={g.group_id} href={`${base}/groups/${g.group_id}`} className="flex items-center justify-between rounded border px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <div className="truncate mr-3">
                  <div className="truncate font-medium">{g.name}</div>
                  <div className="text-[11px] text-neutral-500">Leads: {g.lead_count} • Score: {g.score.toFixed(2)}</div>
                </div>
                <span className="inline-flex items-center rounded bg-emerald-600 text-white text-xs px-2 py-0.5">{g.score.toFixed(2)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Kpi({ label, value, subtle }: { label: string; value: number | string; subtle?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="text-[10px] font-medium uppercase text-neutral-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">{value}</div>
      {subtle ? <div className="text-[10px] text-neutral-500">{subtle}</div> : null}
    </div>
  )
}
