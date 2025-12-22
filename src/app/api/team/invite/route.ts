import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendInviteEmail } from '@/lib/email'

function generateKey() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { role, email, inviteMessage } = body || {}
    if (!role || !email) {
      return NextResponse.json({ ok: false, message: 'Missing role or email' }, { status: 400 })
    }

    const key = generateKey()
    const sb: any = await createServiceClient()
    const now = new Date()
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data, error } = await sb
      .from('team_invites')
      .insert({
        email,
        role,
        message: inviteMessage || '',
        invite_key: key,
        status: 'pending',
        expires_at: expires.toISOString(),
      })
      .select('id')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
    }

    const url = new URL(request.url)
    const origin = `${url.protocol}//${url.host}`
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
    const joinUrl = `${baseUrl}/join?email=${encodeURIComponent(email)}&key=${encodeURIComponent(key)}`
    const sent = await sendInviteEmail({ to: email, message: inviteMessage || '', link: joinUrl })
    console.log('[team/invite] email send result:', sent)

    return NextResponse.json({ ok: true, inviteId: data?.id, key })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Server error' }, { status: 500 })
  }
}
