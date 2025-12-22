import { NextResponse, NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const body = await _req.json()
    const allowed: any = {}
    if (typeof body.email === 'string') allowed.email = body.email
    if (typeof body.role === 'string') allowed.role = body.role
    if (typeof body.message === 'string') allowed.message = body.message
    if (typeof body.status === 'string') allowed.status = body.status
    if (typeof body.expires_at === 'string' || body.expires_at === null) allowed.expires_at = body.expires_at

    const sb: any = await createServiceClient()
    const { data, error } = await sb
      .from('team_invites')
      .update(allowed)
      .eq('id', id)
      .select('id, email, role, message, status, created_at, expires_at, accepted_at')
      .maybeSingle()

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, invite: data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }
  try {
    const sb: any = await createServiceClient()
    const { id } = await params
    const { error } = await sb.from('team_invites').delete().eq('id', id)
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Server error' }, { status: 500 })
  }
}
