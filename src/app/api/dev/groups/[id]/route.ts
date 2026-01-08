import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(['admin', 'owner']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { name, description } = await req.json()
    if (!name && typeof description === 'undefined') return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    const payload: any = {}
    if (name) payload.name = name
    if (typeof description !== 'undefined') payload.description = description
    const { id } = await params;
    const { data, error } = await supa.from('lead_groups').update(payload).eq('id', id).select('*').single()
    if (error) throw error
    return NextResponse.json({ item: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update group' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(['admin', 'owner']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    const { id } = await params;
    const { error } = await supa.from('lead_groups').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete group' }, { status: 500 })
  }
}
