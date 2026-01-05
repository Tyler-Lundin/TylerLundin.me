import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CAN_DELETE = new Set(['admin', 'head_of_marketing', 'head of marketing'])

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; leadId: string }> }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    const role = decoded?.role
    if (!decoded || !CAN_DELETE.has(String(role))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id, leadId } = await params
    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    const { error } = await supa
      .from('lead_group_members')
      .delete()
      .eq('group_id', id)
      .eq('lead_id', leadId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}

