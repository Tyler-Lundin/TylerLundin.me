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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminCookie()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
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
  const admin = await requireAdminCookie()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
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
