import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { Suspense } from 'react'

function formatJson(val: any) {
  try { return JSON.stringify(val, null, 2).slice(0, 800) } catch { return '' }
}

export default async function DevLogsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = (await (searchParams ?? Promise.resolve({}))) as Record<string, string | string[] | undefined>
  const qAction = (Array.isArray(sp.action) ? sp.action[0] : sp.action) || ''
  const qRoute = (Array.isArray(sp.route) ? sp.route[0] : sp.route) || ''
  const qEmail = (Array.isArray(sp.email) ? sp.email[0] : sp.email) || ''
  const qFrom = (Array.isArray(sp.from) ? sp.from[0] : sp.from) || ''
  const qTo = (Array.isArray(sp.to) ? sp.to[0] : sp.to) || ''
  const limit = Math.min(500, Number((Array.isArray(sp.limit) ? sp.limit[0] : sp.limit) || '200'))

  let sb: any
  try { sb = getSupabaseAdmin() } catch { sb = null }
  let query = sb ? sb.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit) : null as any
  if (query && qAction) query = query.ilike('action', `%${qAction}%`)
  if (query && qRoute) query = query.ilike('route', `%${qRoute}%`)
  if (query && qEmail) query = query.ilike('actor_email', `%${qEmail}%`)
  if (query && qFrom) query = query.gte('created_at', new Date(qFrom).toISOString())
  if (query && qTo) query = query.lte('created_at', new Date(qTo).toISOString())
  const rows = query ? (await query).data : []

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Audit Logs</h1>
            <p className="text-sm text-neutral-500">Verbose trail of server actions and API events.</p>
          </div>
          <form method="get" className="grid gap-2 sm:grid-cols-6 text-sm">
            <input name="action" placeholder="action contains" defaultValue={qAction} className="rounded border px-2 py-1" />
            <input name="route" placeholder="route contains" defaultValue={qRoute} className="rounded border px-2 py-1" />
            <input name="email" placeholder="actor email" defaultValue={qEmail} className="rounded border px-2 py-1" />
            <input name="from" type="datetime-local" defaultValue={qFrom} className="rounded border px-2 py-1" />
            <input name="to" type="datetime-local" defaultValue={qTo} className="rounded border px-2 py-1" />
            <button className="rounded border px-3 py-1">Filter</button>
          </form>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="w-40 px-3 py-2 text-left">Time</th>
                  <th className="w-48 px-3 py-2 text-left">Action</th>
                  <th className="w-56 px-3 py-2 text-left">Route</th>
                  <th className="w-28 px-3 py-2 text-left">Actor</th>
                  <th className="w-20 px-3 py-2 text-left">Status</th>
                  <th className="w-56 px-3 py-2 text-left">Payload</th>
                  <th className="w-56 px-3 py-2 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {(rows || []).map((r: any) => (
                  <tr key={r.id} className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-900 dark:even:bg-neutral-950 align-top">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-500">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium truncate max-w-[200px]" title={r.action || ''}>{r.action || '—'}</div>
                      <div className="text-[10px] text-neutral-500">{r.method || ''}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="truncate max-w-[280px]" title={r.route || ''}>{r.route || '—'}</div>
                      <div className="text-[10px] text-neutral-500 truncate" title={r.ip || ''}>{r.ip || ''}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="truncate max-w-[160px]" title={r.actor_email || ''}>{r.actor_email || '—'}</div>
                      <div className="text-[10px] text-neutral-500">{r.actor_role || ''}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] border ${Number(r.status) >= 400 ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'}`}>{r.status ?? '—'}</span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <pre className="max-w-[420px] whitespace-pre-wrap text-[11px] text-neutral-600 dark:text-neutral-300">{formatJson(r.payload) || '—'}</pre>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <pre className="max-w-[420px] whitespace-pre-wrap text-[11px] text-neutral-600 dark:text-neutral-300">{formatJson(r.result) || (r.error ? String(r.error) : '—')}</pre>
                    </td>
                  </tr>
                ))}
                {(rows || []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500">No logs for this filter.</td>
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
