import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendInviteEmail } from '@/lib/email'
import { auditLog } from '@/lib/audit'

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

    const { getBaseUrl } = await import('@/lib/url')
    const baseUrl = getBaseUrl(request as any)
    const joinUrl = `${baseUrl}/join?email=${encodeURIComponent(email)}&key=${encodeURIComponent(key)}`
    console.log('[api/team/invite] Sending invite', {
      to: email,
      provider: process.env.BREVO_API_KEY ? 'brevo' : (process.env.RESEND_API_KEY ? 'resend' : 'none'),
      resendKeySet: !!process.env.RESEND_API_KEY,
      brevoKeySet: !!process.env.BREVO_API_KEY,
      baseUrl,
      joinUrl,
    })
    const sent = await sendInviteEmail({ to: email, message: inviteMessage || '', link: joinUrl })
    console.log('[team/invite] email send result:', sent)

    // Audit log
    const headers = Object.fromEntries(request.headers.entries())
    const ip = (headers['x-forwarded-for'] || headers['x-real-ip'] || '').split(',')[0]?.trim() || null
    const ua = headers['user-agent'] || null
    await auditLog({
      route: '/api/team/invite',
      action: 'team.invite.send',
      method: 'POST',
      status: 200,
      actorEmail: null,
      actorRole: null,
      ip,
      userAgent: ua,
      payload: { role, email },
      result: sent,
      error: sent && (sent as any).error ? String((sent as any).error) : null,
    })

    return NextResponse.json({ ok: true, inviteId: data?.id, key })
  } catch (e: any) {
    try {
      const headers = (typeof Headers !== 'undefined') ? undefined : undefined
      // best-effort audit (request not accessible if we threw before parsing)
      await auditLog({ route: '/api/team/invite', action: 'team.invite.send', method: 'POST', status: 500, error: e?.message || String(e) })
    } catch {}
    return NextResponse.json({ ok: false, message: e?.message || 'Server error' }, { status: 500 })
  }
}
