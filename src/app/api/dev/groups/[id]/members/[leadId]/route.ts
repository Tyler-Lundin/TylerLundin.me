import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth';
import { getAdminClient } from '@/lib/leadgen/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; leadId: string }> }) {
  try {
    await requireRoles(['admin', 'owner']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    const { id, leadId } = await params;
    const { error } = await supa.from('lead_group_members').delete().match({ group_id: id, lead_id: leadId })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to remove member' }, { status: 500 })
  }
}
