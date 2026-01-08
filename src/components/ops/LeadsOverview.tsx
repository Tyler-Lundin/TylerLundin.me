import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth'
import LeadsOverviewActionsClient from '@/components/ops/LeadsOverviewActionsClient'
import { Target, Globe, ShieldAlert, Clock, BarChart3, Zap, ArrowRight, MapPin, Search } from 'lucide-react'

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
  const sb = await createServiceClient()
  const role = await getUserRole()
  const base = role === 'admin' ? '/dev' : ((role === 'head_of_marketing' || role === 'head of marketing') ? '/marketing' : '/dev')

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

  const totalLeads = leadsTotalRes.count || 0
  const withWeb = leadsWebYesRes.count || 0
  const noWeb = leadsWebNoRes.count || 0
  const last24h = leadsTodayRes.count || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Leads Overview</h2>
          <p className="text-sm text-neutral-500">Pipeline Metrics & Segment Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* --- Card 1: Metrics (Health) --- */}
        <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 h-96">
          <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <BarChart3 className="size-4" />
              </div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Database Stats</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 grid grid-cols-1 gap-3">
            <MetricBox label="Total Leads" value={totalLeads} icon={<Target className="size-3.5" />} color="bg-blue-500" />
            <MetricBox label="With Website" value={withWeb} sub={`${Math.round((withWeb / Math.max(1, totalLeads)) * 100)}%`} icon={<Globe className="size-3.5" />} color="bg-emerald-500" />
            <MetricBox label="No Website" value={noWeb} sub={`${Math.round((noWeb / Math.max(1, totalLeads)) * 100)}%`} icon={<ShieldAlert className="size-3.5" />} color="bg-rose-500" />
            <MetricBox label="Last 24 Hours" value={last24h} icon={<Clock className="size-3.5" />} color="bg-amber-500" />
          </div>
        </div>

        {/* --- Card 2: Top Segments (Targeting) --- */}
        <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 h-96">
          <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Zap className="size-4" />
              </div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Top Segments</span>
            </div>
            <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase">
               Ranked
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {ranked.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-400 italic">No groups yet.</div>
            ) : (
              <div className="flex flex-col gap-1">
                {ranked.slice(0, 8).map(g => (
                  <Link 
                    key={g.group_id}
                    href={`${base}/groups/${g.group_id}`}
                    className="group flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate max-w-[140px]">{g.name}</span>
                        <span className="text-[10px] text-neutral-500 uppercase font-medium">{g.lead_count} Leads</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {g.score.toFixed(1)}
                      </div>
                      <ArrowRight className="size-3 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-neutral-100 p-3 text-center text-xs text-neutral-400 dark:border-neutral-800 shrink-0">
             <Link href={`${base}/groups`} className="hover:text-neutral-600 dark:hover:text-neutral-300">Manage All Groups &rarr;</Link>
          </div>
        </div>

        {/* --- Card 3: Quick Controls --- */}
        <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 h-96">
          <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                <MapPin className="size-4" />
              </div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Lead Ops</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 flex flex-col gap-4">
            <Link href={`${base}/leads`} className="group flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 hover:scale-[1.02] transition-all">
               <div className="flex size-10 items-center justify-center rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
                  <Search className="size-5 text-blue-600 dark:text-blue-400" />
               </div>
               <div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">Lead Generator</div>
                  <div className="text-xs text-neutral-500">Scan Google Places</div>
               </div>
            </Link>

            <Link href={`${base}/leads/swipe`} className="group flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 hover:scale-[1.02] transition-all">
               <div className="flex size-10 items-center justify-center rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
                  <Zap className="size-5 text-emerald-600 dark:text-emerald-400" />
               </div>
               <div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">Swipe Mode</div>
                  <div className="text-xs text-neutral-500">Review & filter leads</div>
               </div>
            </Link>

            <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
               <LeadsOverviewActionsClient />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function MetricBox({ label, value, sub, icon, color }: { label: string; value: number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/30">
      <div className="flex items-center gap-3">
        <div className={`flex size-8 items-center justify-center rounded-lg text-white ${color} shadow-sm`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-tight">{label}</span>
          <span className="text-lg font-black text-neutral-900 dark:text-white leading-none">{value.toLocaleString()}</span>
        </div>
      </div>
      {sub && (
        <div className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
          {sub}
        </div>
      )}
    </div>
  )
}

