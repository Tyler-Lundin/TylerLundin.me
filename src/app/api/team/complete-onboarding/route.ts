import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const INVITE_SECRET = process.env.INVITE_SECRET || process.env.JWT_SECRET || 'invite-secret'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, passwords, profile } = body || {}
    if (!token || !Array.isArray(passwords) || passwords.length !== 3) {
      return NextResponse.json({ ok: false, message: 'Invalid payload' }, { status: 400 })
    }

    let payload: any
    try {
      payload = jwt.verify(token, INVITE_SECRET)
    } catch {
      return NextResponse.json({ ok: false, message: 'Invalid token' }, { status: 400 })
    }

    const { inviteId, email, role } = payload || {}
    if (!inviteId || !email) {
      return NextResponse.json({ ok: false, message: 'Invalid token payload' }, { status: 400 })
    }

    const sb: any = await createServiceClient()

    // Upsert user profile
    const { data: user, error: userErr } = await sb
      .from('users')
      .upsert({ email, full_name: profile?.full_name || null, role: role || 'member', updated_at: new Date().toISOString() }, { onConflict: 'email' })
      .select('id')
      .maybeSingle()
    if (userErr) return NextResponse.json({ ok: false, message: userErr.message }, { status: 500 })
    if (!user) return NextResponse.json({ ok: false, message: 'Failed to create user' }, { status: 500 })

    // Hash passwords
    const [h1, h2, h3] = await Promise.all(passwords.map((p: string) => bcrypt.hash(p, 10)))

    // Store credentials
    const { error: credErr } = await sb
      .from('team_credentials')
      .upsert({ user_id: user.id, password_1_hash: h1, password_2_hash: h2, password_3_hash: h3 })
    if (credErr) return NextResponse.json({ ok: false, message: credErr.message }, { status: 500 })

    // Mark invite accepted
    await sb
      .from('team_invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', inviteId)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Server error' }, { status: 500 })
  }
}

