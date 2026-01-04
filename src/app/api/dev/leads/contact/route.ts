import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { Resend } from 'resend'

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

type EmailItem = { lead_id: string; to?: string; subject: string; body: string; defaults?: Record<string, any> }

export async function POST(req: NextRequest) {
  const admin = await requireAdminCookie()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
  try {
    const { channel, items } = await req.json()
    if (!channel || !Array.isArray(items)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

    if (channel === 'email') {
      const resendKey = process.env.RESEND_API_KEY
      const brevoKey = process.env.BREVO_API_KEY
      const fromEmail = process.env.OUTREACH_FROM || process.env.CONTACT_FROM || 'outreach@tylerlundin.me'
      const sent: string[] = []
      const failed: { lead_id: string; error: string }[] = []

      for (const raw of items as EmailItem[]) {
        const to = (raw.to || '').trim()
        const subject = String(raw.subject || '').trim()
        const html = `<div style="white-space:pre-wrap; font-family: -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.55">${
          (raw.body || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }</div>`
        if (!to || !subject || !raw.body) {
          failed.push({ lead_id: raw.lead_id, error: 'Missing to/subject/body' })
          continue
        }

        try {
          if (brevoKey) {
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'api-key': brevoKey },
              body: JSON.stringify({ from: { email: fromEmail }, to: [{ email: to }], subject, htmlContent: html }),
            })
            if (!res.ok) {
              const text = await res.text().catch(() => '')
              throw new Error(`Brevo ${res.status}: ${text}`)
            }
          } else if (resendKey) {
            const resend = new Resend(resendKey)
            await resend.emails.send({ from: fromEmail, to, subject, html })
          } else {
            console.log('[Outreach email]', { to, subject })
          }
          sent.push(raw.lead_id)
        } catch (e: any) {
          failed.push({ lead_id: raw.lead_id, error: e?.message || 'send failed' })
        }
      }

      return NextResponse.json({ ok: true, sent, failed })
    }

    if (channel === 'sms' || channel === 'call') {
      return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
    }

    return NextResponse.json({ error: 'Unsupported channel' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}
