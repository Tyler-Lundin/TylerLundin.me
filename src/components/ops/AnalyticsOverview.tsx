import { createServiceClient } from '@/lib/supabase/server'

type Kpi = { label: string; value: number; hint?: string }

function KpiCard({ k }: { k: Kpi }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{k.label}</div>
      <div className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{k.value}</div>
      {k.hint && <div className="mt-1 text-xs text-neutral-500">{k.hint}</div>}
    </div>
  )
}

function formatTime(s: string) {
  try { return new Date(s).toLocaleString() } catch { return s }
}

export default async function AnalyticsOverview() {
  const sb = await createServiceClient()

  const since24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [last24Res, last24ErrRes, last7dRes, recentRes] = await Promise.all([
    sb.from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', since24),
    sb.from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', since24).gte('status', 400),
    sb.from('audit_logs').select('action,route,status,created_at').gte('created_at', since7d).limit(1000),
    sb.from('audit_logs').select('action,route,status,created_at,ip').order('created_at', { ascending: false }).limit(20),
  ])

  const last24 = last24Res.count || 0
  const last24Err = last24ErrRes.count || 0
  const topActionsMap = new Map<string, number>()
  ;(last7dRes.data || []).forEach(r => {
    const key = String((r as any).action || '—')
    topActionsMap.set(key, (topActionsMap.get(key) || 0) + 1)
  })
  const topActions = Array.from(topActionsMap.entries()).sort((a,b) => b[1]-a[1]).slice(0,5)

  const kpis: Kpi[] = [
    { label: 'Events (24h)', value: last24 },
    { label: 'Errors (24h)', value: last24Err },
    { label: 'Unique Actions (7d)', value: topActionsMap.size },
  ]

  const recent = (recentRes.data || []) as Array<{ action?: string; route?: string; status?: number; created_at: string; ip?: string }>

  return (
    <section className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Analytics Overview</h2>
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kpis.map((k) => (<KpiCard key={k.label} k={k} />))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
        <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">Top Actions (7d)</h3>
        {topActions.length === 0 ? (
          <div className="text-sm text-neutral-500">No data.</div>
        ) : (
          <ul className="text-sm text-neutral-700 dark:text-neutral-300">
            {topActions.map(([name, count]) => (
              <li key={name} className="flex items-center justify-between border-b border-neutral-100 py-2 last:border-0 dark:border-neutral-800">
                <span className="font-medium">{name}</span>
                <span className="text-neutral-500">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
        <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">Recent Events</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="w-36 px-3 py-2 text-left">Time</th>
                <th className="w-44 px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">Route</th>
                <th className="w-16 px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-900 dark:even:bg-neutral-950">
                  <td className="px-3 py-2 text-neutral-500">{formatTime(r.created_at)}</td>
                  <td className="px-3 py-2 font-medium truncate max-w-[220px]">{r.action || '—'}</td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400 truncate max-w-[420px]">{r.route || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] border ${Number(r.status) >= 400 ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'}`}>{r.status ?? '—'}</span>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-4 text-center text-neutral-500">No events</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

