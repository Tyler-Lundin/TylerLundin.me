import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'
import { generateSmartSuggestions, Suggestion } from '@/lib/leadgen/suggestions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SearchRun {
  niche: string;
  location: string;
  runs: number;
  last_searched_at: string | null;
  sum_deduped: number;
  sum_saved: number;
}

export async function POST(req: NextRequest) {
  try {
    const { count = 10 } = await req.json().catch(() => ({}))
    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ items: [] })

    // Pull recent aggregates to know what we've already done
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supa.rpc('execute_sql', {
      sql_query: "select niche, location, count(*) as runs, max(finished_at) as last_searched_at, sum(deduped_count) as sum_deduped, sum(saved_count) as sum_saved from public.lead_search_runs group by niche, location order by max(finished_at) nulls first",
    }) as { data: SearchRun[] | null, error: any }
    if (error) throw error

    const rows = Array.isArray(data) ? data : []
    
    // 1. Generate Fresh "Gap" Suggestions
    const freshSuggestions = generateSmartSuggestions(rows, count)

    // 2. Generate "Maintenance" Suggestions (Retry/Stale) from existing logic
    const stale: Suggestion[] = rows
      .filter((r) => !!r.last_searched_at)
      .sort((a, b) => new Date(a.last_searched_at!).getTime() - new Date(b.last_searched_at!).getTime())
      .slice(0, count)
      .map((r) => ({
        niche: r.niche,
        location: r.location,
        reason: `Refresh data (last run: ${new Date(r.last_searched_at!).toLocaleDateString()})`,
        score: 10, 
        type: 'retry'
      }))

    // 3. Merge Strategies
    const combined: Suggestion[] = []
    
    // Interleave: 2 Fresh, 1 Stale
    let fIdx = 0, sIdx = 0;
    while (combined.length < count) {
      if (fIdx < freshSuggestions.length) combined.push(freshSuggestions[fIdx++]);
      if (combined.length < count && fIdx < freshSuggestions.length) combined.push(freshSuggestions[fIdx++]);
      if (combined.length < count && sIdx < stale.length) combined.push(stale[sIdx++]);
      
      if (fIdx >= freshSuggestions.length && sIdx >= stale.length) break;
    }

    return NextResponse.json({ items: combined })
  } catch (e: unknown) {
    console.error('Suggest error:', e)
    const msg = e instanceof Error ? e.message : 'Failed to suggest'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

