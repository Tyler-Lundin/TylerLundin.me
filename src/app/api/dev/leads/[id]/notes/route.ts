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
      .from('lead_notes')
      .select('*, author:users(full_name)')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ items: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRoles(['admin', 'owner'])
    const { id } = await params
    const { body } = await req.json()
    if (!body) return NextResponse.json({ error: 'Body required' }, { status: 400 })

    const supa = getAdminClient()
    const { data, error } = await supa
      .from('lead_notes')
      .insert({
        lead_id: id,
        author_id: user.id,
        body
      })
      .select('*, author:users(full_name)')
      .single()

    if (error) throw error
    
    // Log activity
    await supa.from('lead_events').insert({
      lead_id: id,
      type: 'note_added',
      payload: { note_id: data.id }
    })

    return NextResponse.json({ item: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to save note' }, { status: 500 })
  }
}
