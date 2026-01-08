import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(['admin', 'owner'])
    const { id } = await params
    const supa = getAdminClient()
    
    const { data, error } = await supa
      .from('lead_events')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ items: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch activity' }, { status: 500 })
  }
}
