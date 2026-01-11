import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth';
import { getAdminClient } from '@/lib/leadgen/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    await requireRoles(['admin', 'owner']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({})) as { deleteConvertedInGroups?: boolean; dryRun?: boolean }
    console.log('[leads.clean] body =', body)
    const deleteConvertedInGroups = body.deleteConvertedInGroups !== false
    const dryRun = !!body.dryRun

    const supa = getAdminClient()
    if (!supa) {
      console.error('[leads.clean] Supabase not configured')
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Determine candidates WITHOUT using RPC (to avoid missing function)
    // 1) Collect grouped lead IDs
    const grouped = new Set<string>()
    {
      let offset = 0
      const page = 1000
      while (true) {
        const { data, error } = await supa
          .from('lead_group_members')
          .select('lead_id')
          .range(offset, offset + page - 1)
        if (error) { console.error('[leads.clean] lead_group_members error', error); throw error }
        for (const r of data || []) grouped.add(r.lead_id as string)
        if (!data || data.length < page) break
        offset += page
      }
    }
    // 2) Collect converted lead IDs (crm_clients.lead_id)
    const converted = new Set<string>()
    {
      let offset = 0
      const page = 1000
      while (true) {
        const { data, error } = await supa
          .from('crm_clients')
          .select('lead_id')
          .not('lead_id', 'is', null)
          .range(offset, offset + page - 1)
        if (error) { console.error('[leads.clean] crm_clients lead_id error', error); throw error }
        for (const r of data || []) if (r.lead_id) converted.add(r.lead_id as string)
        if (!data || data.length < page) break
        offset += page
      }
    }
    // 3) Build candidate ID list: all ungrouped + (optional) converted
    const candidateIds = new Set<string>()
    {
      let offset = 0
      const page = 1000
      while (true) {
        const { data, error } = await supa
          .from('leads')
          .select('id')
          .order('id', { ascending: true })
          .range(offset, offset + page - 1)
        if (error) { console.error('[leads.clean] leads fetch error', error); throw error }
        for (const r of data || []) {
          const id = r.id as string
          if (!grouped.has(id)) candidateIds.add(id)
        }
        if (!data || data.length < page) break
        offset += page
      }
    }
    if (deleteConvertedInGroups) for (const id of converted) candidateIds.add(id)

    const ids = Array.from(candidateIds)
    const ungroupedCount = ids.filter((id) => !converted.has(id)).length // approximate breakdown
    const convertedCount = ids.filter((id) => converted.has(id)).length
    console.log('[leads.clean] candidate counts', { groupedSize: grouped.size, convertedSize: converted.size, idsLen: ids.length, ungroupedCount, convertedCount, dryRun })

    if (dryRun || ids.length === 0) {
      return NextResponse.json({ deleted: 0, total_candidates: ids.length, ungrouped: ungroupedCount, converted: convertedCount })
    }

    // Delete via PostgREST in manageable chunks for reliability
    const chunk = 200
    let deletedCount = 0
    for (let i = 0; i < ids.length; i += chunk) {
      const part = ids.slice(i, i + chunk)
      if (part.length === 0) continue
      console.log('[leads.clean] deleting chunk', i, 'size', part.length)
      const { data: delRows, error: delErr } = await supa
        .from('leads')
        .delete()
        .in('id', part)
        .select('id')
      if (delErr) { console.error('[leads.clean] delete error', delErr); throw delErr }
      deletedCount += delRows?.length || 0
    }

    console.log('[leads.clean] deletedCount =', deletedCount)
    return NextResponse.json({ deleted: deletedCount, total_candidates: ids.length, ungrouped: ungroupedCount, converted: convertedCount })
  } catch (e: any) {
    console.error('[leads.clean] fatal', e)
    return NextResponse.json({ error: e?.message || 'Failed to clean leads' }, { status: 500 })
  }
}
