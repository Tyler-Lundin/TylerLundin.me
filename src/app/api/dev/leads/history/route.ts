import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ items: [] })
    // Aggregate by niche+location
    const { data, error } = await supa.rpc('execute_sql', {
      sql_query: `
        with agg as (
          select
            niche,
            location,
            count(*) as runs,
            max(finished_at) as last_searched_at,
            coalesce(sum(original_count),0) as sum_original,
            coalesce(sum(deduped_count),0) as sum_deduped,
            coalesce(sum(saved_count),0) as sum_saved
          from public.lead_search_runs
          group by 1,2
        )
        select * from agg order by last_searched_at nulls first, sum_saved asc, runs asc limit 100;
      `,
    }) as any
    if (error) throw error
    const rows = Array.isArray(data) ? (data as any[]).map((r: any) => ({
      niche: r.niche,
      location: r.location,
      runs: Number(r.runs || 0),
      last_searched_at: r.last_searched_at,
      sum_original: Number(r.sum_original || 0),
      sum_deduped: Number(r.sum_deduped || 0),
      sum_saved: Number(r.sum_saved || 0),
      save_rate: (Number(r.sum_saved || 0) && Number(r.sum_deduped || 0)) ? (Number(r.sum_saved) / Math.max(1, Number(r.sum_deduped))) : 0,
    })) : []
    return NextResponse.json({ items: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load history' }, { status: 500 })
  }
}

