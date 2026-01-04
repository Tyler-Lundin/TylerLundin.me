import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const secret = process.env.JWT_SECRET || 'your-secret-key'
  if (!token) return { ok: false, status: 401 as const, error: 'Unauthorized' }
  try {
    const decoded = jwt.verify(token, secret) as any
    if (!decoded || decoded.role !== 'admin') return { ok: false, status: 403 as const, error: 'Forbidden' }
    return { ok: true as const }
  } catch {
    return { ok: false, status: 401 as const, error: 'Unauthorized' }
  }
}

export async function POST(_req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
  try {
    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    // Ensure group exists
    const { data: existing } = await supa.from('lead_groups').select('id').eq('name', 'No Website').maybeSingle()
    let groupId = existing?.id as string | undefined
    if (!groupId) {
      const { data: created, error: createErr } = await supa
        .from('lead_groups')
        .insert({ name: 'No Website', description: 'Leads without a website' } as any)
        .select('id')
        .single()
      if (createErr) throw createErr
      groupId = created?.id
    }
    if (!groupId) return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })

    // Fetch all no-website leads (batch)
    const batchSize = 1000
    let offset = 0
    const allLeadIds: string[] = []
    while (true) {
      const { data: leads, error } = await supa
        .from('leads')
        .select('id')
        .is('website', null)
        .order('id', { ascending: true })
        .range(offset, offset + batchSize - 1)
      if (error) throw error
      const ids = (leads || []).map((l: any) => l.id)
      allLeadIds.push(...ids)
      if (ids.length < batchSize) break
      offset += batchSize
    }

    // Existing members for the group
    const membersBatch = 5000
    offset = 0
    const existingMemberIds = new Set<string>()
    while (true) {
      const { data: members, error } = await supa
        .from('lead_group_members')
        .select('lead_id')
        .eq('group_id', groupId)
        .order('lead_id', { ascending: true })
        .range(offset, offset + membersBatch - 1)
      if (error) throw error
      for (const m of members || []) existingMemberIds.add(m.lead_id)
      if ((members || []).length < membersBatch) break
      offset += membersBatch
    }

    // Compute new members to insert
    const toInsert = allLeadIds.filter((id) => !existingMemberIds.has(id)).map((id) => ({ group_id: groupId!, lead_id: id }))

    // Upsert in chunks
    const insertChunk = 1000
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += insertChunk) {
      const chunk = toInsert.slice(i, i + insertChunk)
      const { error } = await supa
        .from('lead_group_members')
        .upsert(chunk as any, { onConflict: 'group_id, lead_id', ignoreDuplicates: true })
      if (error) throw error
      inserted += chunk.length
    }

    return NextResponse.json({ group_id: groupId, total_no_website: allLeadIds.length, added: inserted })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Migration failed' }, { status: 500 })
  }
}
