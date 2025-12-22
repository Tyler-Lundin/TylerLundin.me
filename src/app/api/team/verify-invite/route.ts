import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'

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
    return NextResponse.json({ ok: true, token })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Server error' }, { status: 500 })
  }
}

