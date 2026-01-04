import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function requireAdminCookie() {
  return cookies().then((cookieStore) => {
    const token = cookieStore.get('access_token')?.value
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    if (!token) return { ok: false, status: 401 as const, error: 'Unauthorized' }
    try {
      const decoded = jwt.verify(token, secret) as any
      if (!decoded || decoded.role !== 'admin') return { ok: false, status: 403 as const, error: 'Forbidden' }
      return { ok: true as const }
    } catch (e) {
      return { ok: false, status: 401 as const, error: 'Unauthorized' }
    }
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; leadId: string }> }) {
  const admin = await requireAdminCookie()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
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
