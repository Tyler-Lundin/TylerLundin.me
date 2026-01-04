import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { leads } = await req.json()
    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'leads array required' }, { status: 400 })
    }

    // Minimal validation and normalization
    const cleaned: any[] = []
    const seen = new Set<string>()
    for (const l of leads) {
      const pid = l?.google_place_id
      if (!pid || typeof pid !== 'string') continue
      if (seen.has(pid)) continue
      seen.add(pid)
      // Ensure required fields exist for DB constraints
      if (!l?.niche || !l?.location) continue
      cleaned.push({ ...l })
    }
    if (cleaned.length === 0) return NextResponse.json({ count: 0 })

    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    // Per-pair counts for logging
    const pairCounts = new Map<string, number>() // key niche||location
    cleaned.forEach((l) => {
      const key = `${l.niche}||${l.location}`
      pairCounts.set(key, (pairCounts.get(key) || 0) + 1)
    })

    const chunkSize = 500
    let total = 0
    // Collect ids of leads with no website to add to group
    const noWebsitePlaceIds = new Set<string>()
    cleaned.forEach((l) => { if (!l.website) noWebsitePlaceIds.add(l.google_place_id) })
    const upsertedIdsNoWebsite: string[] = []
    for (let i = 0; i < cleaned.length; i += chunkSize) {
      const chunk = cleaned.slice(i, i + chunkSize)
      const { data, error } = await supa
        .from('leads')
        .upsert(chunk, { onConflict: 'google_place_id', ignoreDuplicates: false })
        .select('id, google_place_id')
      if (error) throw error
      const rows = data || []
      total += rows.length
      for (const row of rows) {
        if (row.google_place_id && noWebsitePlaceIds.has(row.google_place_id)) {
          upsertedIdsNoWebsite.push(row.id)
        }
      }
    }

    // Log runs per pair (dry_run=false)
    try {
      const rows: any[] = []
      pairCounts.forEach((count, key) => {
        const [niche, location] = key.split('||')
        rows.push({
          niche,
          location,
          original_count: count,
          deduped_count: count,
          saved_count: count,
          dry_run: false,
          finished_at: new Date().toISOString(),
          notes: 'manual save from preview',
        })
      })
      if (rows.length) await supa.from('lead_search_runs').insert(rows as any)
    } catch {}

    // Ensure "No Website" group exists and add members
    try {
      const { data: group } = await supa.from('lead_groups').select('id').eq('name', 'No Website').maybeSingle()
      let groupId = group?.id as string | undefined
      if (!groupId) {
        const { data: created } = await supa.from('lead_groups').insert({ name: 'No Website', description: 'Leads without a website' } as any).select('id').single()
        groupId = created?.id
      }
      if (groupId && upsertedIdsNoWebsite.length) {
        const members = upsertedIdsNoWebsite.map((id) => ({ group_id: groupId!, lead_id: id }))
        await supa.from('lead_group_members').upsert(members as any, { onConflict: 'group_id, lead_id', ignoreDuplicates: true })
      }
    } catch {}

    return NextResponse.json({ count: total })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to save leads' }, { status: 500 })
  }
}
