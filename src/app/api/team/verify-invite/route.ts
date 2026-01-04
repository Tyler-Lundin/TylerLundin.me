import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'
import { auditLog } from '@/lib/audit'

const INVITE_SECRET = process.env.INVITE_SECRET || process.env.JWT_SECRET || 'invite-secret'

export async function POST(request: Request) {
  try {
    const { email, key } = await request.json()
    if (!email || !key) return NextResponse.json({ ok: false, message: 'Missing email or key' }, { status: 400 })

    const sb: any = await createServiceClient()
    const { data, error } = await sb
      .from('team_invites')
      .select('id, email, role, status, expires_at')
      .eq('email', email)
      .eq('invite_key', key)
      .eq('status', 'pending')
      .maybeSingle()

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ ok: false, message: 'Invalid or expired invite' }, { status: 400 })

    const now = new Date()
    if (data.expires_at && new Date(data.expires_at) < now) {
      return NextResponse.json({ ok: false, message: 'Invite expired' }, { status: 400 })
    }

    const token = jwt.sign({ inviteId: data.id, email: data.email, role: data.role }, INVITE_SECRET, { expiresIn: '2h' })

    // Audit log
    const headers = Object.fromEntries(request.headers.entries())
    const ip = (headers['x-forwarded-for'] || headers['x-real-ip'] || '').split(',')[0]?.trim() || null
    const ua = headers['user-agent'] || null
    await auditLog({
      route: '/api/team/verify-invite',
      action: 'team.invite.verify',
      method: 'POST',
      status: 200,
      actorEmail: email,
      ip,
      userAgent: ua,
      payload: { email },
      result: { ok: true },
    })

    return NextResponse.json({ ok: true, token })
  } catch (e: any) {
    try { await auditLog({ route: '/api/team/verify-invite', action: 'team.invite.verify', method: 'POST', status: 500, error: e?.message || String(e) }) } catch {}
    return NextResponse.json({ ok: false, message: e?.message || 'Server error' }, { status: 500 })
  }
}
