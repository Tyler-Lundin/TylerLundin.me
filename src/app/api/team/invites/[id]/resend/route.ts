import { NextResponse, NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendInviteEmail } from '@/lib/email'
import { requireAdmin } from '@/lib/auth'

function generateKey() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const sb: any = await createServiceClient()
    const { data: invite, error: fetchErr } = await sb
      .from('team_invites')
      .select('id, email, role, message')
      .eq('id', id)
      .maybeSingle()
    if (fetchErr) return NextResponse.json({ ok: false, message: fetchErr.message }, { status: 500 })
    if (!invite) return NextResponse.json({ ok: false, message: 'Invite not found' }, { status: 404 })

    const key = generateKey()
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const { data: updated, error: updErr } = await sb
      .from('team_invites')
      .update({ invite_key: key, status: 'pending', expires_at: expires.toISOString() })
      .eq('id', id)
      .select('id, email, role, message, status, created_at, expires_at, accepted_at')
      .maybeSingle()
    if (updErr) return NextResponse.json({ ok: false, message: updErr.message }, { status: 500 })

    const url = new URL(request.url)
    const origin = `${url.protocol}//${url.host}`
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
    const joinUrl = `${baseUrl}/join?email=${encodeURIComponent(updated.email)}&key=${encodeURIComponent(key)}`
    const sent = await sendInviteEmail({ to: updated.email, message: updated.message || '', link: joinUrl })
    console.log('[team/invites/:id/resend] email send result:', sent)

    return NextResponse.json({ ok: true, invite: updated })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Server error' }, { status: 500 })
  }
}
