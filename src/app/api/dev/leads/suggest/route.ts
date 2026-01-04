import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { count = 10 } = await req.json().catch(() => ({}))
    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ items: [] })

    // Pull recent aggregates
    const { data, error } = await supa.rpc('execute_sql', {
      sql_query: `
        with agg as (
          select niche, location,
            count(*) as runs,
            max(finished_at) as last_searched_at,
            sum(deduped_count) as sum_deduped,
            sum(saved_count) as sum_saved
          from public.lead_search_runs
          group by 1,2
        )
        select * from agg order by last_searched_at nulls first, sum_saved asc, runs asc limit 200;
      `,
    }) as any
    if (error) throw error

    const rows = Array.isArray(data) ? data : []
    const suggestions: { niche: string; location: string; reason: string }[] = []

    // Heuristic fallback: prioritize combos never searched, then stale, and low save ratio.
    const never = rows.filter((r: any) => !r.last_searched_at)
    const stale = rows.filter((r: any) => !!r.last_searched_at).sort((a: any, b: any) => new Date(a.last_searched_at).getTime() - new Date(b.last_searched_at).getTime())
    const lowYield = rows.slice().sort((a: any, b: any) => (Number(a.sum_saved||0)/Math.max(1,Number(a.sum_deduped||0))) - (Number(b.sum_saved||0)/Math.max(1,Number(b.sum_deduped||0))))

    const pick = (arr: any[], label: string) => {
      for (const r of arr) {
        if (suggestions.length >= count) break
        const sr = Number(r.sum_saved||0)/Math.max(1,Number(r.sum_deduped||0))
        suggestions.push({ niche: r.niche, location: r.location, reason: `${label}; saveRate=${sr.toFixed(2)}; runs=${r.runs}` })
      }
    }
    pick(never, 'never searched')
    pick(stale, 'stale')
    pick(lowYield, 'low save rate')

    // If OpenAI key present, refine list (optional). Keep within non-networked env gracefully.
    const key = process.env.OPENAI_API_KEY
    if (key && suggestions.length) {
      try {
        const client = new OpenAI({ apiKey: key })
        const prompt = `You are helping prioritize niche+location lead searches. Given these candidates with reasons, return the top ${count} as JSON array of {niche, location, reason} prioritizing variety and likely convertibility of small local businesses.`
        const content = JSON.stringify(suggestions.slice(0, Math.min(50, suggestions.length)))
        const resp = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content },
          ],
          temperature: 0.2,
        })
        const text = resp.choices?.[0]?.message?.content || ''
        try {
          const json = JSON.parse(text)
          if (Array.isArray(json)) {
            return NextResponse.json({ items: json.slice(0, count) })
          }
        } catch {}
      } catch {}
    }

    return NextResponse.json({ items: suggestions.slice(0, count) })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to suggest' }, { status: 500 })
  }
}

