import { Resend } from 'resend'

export type InviteEmailParams = {
  to: string
  message: string
  link: string
}

export async function sendInviteEmail({ to, message, link }: InviteEmailParams) {
  const resendKey = process.env.RESEND_API_KEY
  const brevoKey = process.env.BREVO_API_KEY
  const from = process.env.TEAM_INVITE_FROM || process.env.CONTACT_FROM || process.env.EMAIL_FROM || 'invite@tylerlundin.me'

  // Try to parse the 4-digit key out of the link for convenience in the email body
  let keyText = ''
  try {
    const u = new URL(link)
    keyText = u.searchParams.get('key') || ''
  } catch {}

  const subject = process.env.TEAM_INVITE_SUBJECT || 'You’re invited to join the Dev Team'
  const brand = process.env.TEAM_INVITE_BRAND || 'Dev Team'

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 8px 0">Invitation to ${brand}</h2>
      <p>You’ve been invited to join the team.</p>
      ${message ? `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>` : ''}
      ${keyText ? `<p><b>Your key:</b> <code style="font-weight:bold; font-size:16px">${keyText}</code></p>` : ''}
      <p>
        Click the link below to accept the invite and complete onboarding:
      </p>
      <p><a href="${link}">${link}</a></p>
      <hr style="margin:16px 0;border:none;border-top:1px solid #eee" />
      <p style="font-size:12px;color:#666">If you didn’t expect this, you can ignore this email.</p>
    </div>
  `

  // Prefer Brevo if configured, otherwise Resend
  if (brevoKey) {
    try {
      console.log('[sendInviteEmail] provider=brevo to=%s subject=%s', to, subject)
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': brevoKey },
        body: JSON.stringify({
          sender: { email: from },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      })
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        console.error('[sendInviteEmail] Brevo error:', resp.status, text)
        return { ok: false, error: `Brevo ${resp.status}` }
      }
      return { ok: true, provider: 'brevo' }
    } catch (e) {
      console.error('[sendInviteEmail] Brevo send failed:', e)
      // Fall through to Resend if available
    }
  }

  if (!resendKey) {
    console.warn('[sendInviteEmail] RESEND_API_KEY is not set; skipping email send. to=%s', to)
    return { ok: false, skipped: true }
  }

  const resend = new Resend(resendKey)
  try {
    console.log('[sendInviteEmail] provider=resend to=%s subject=%s from=%s', to, subject, from)
    const res = await resend.emails.send({ from, to, subject, html })
    if ((res as any)?.error) {
      console.error('[sendInviteEmail] Resend error:', (res as any).error)
      // Fallback to verified Resend sender if domain isn't verified yet
      const fallbackFrom = 'onboarding@resend.dev'
      try {
        const res2 = await resend.emails.send({ from: fallbackFrom, to, subject, html })
        if ((res2 as any)?.error) {
          console.error('[sendInviteEmail] Fallback error:', (res2 as any).error)
          return { ok: false, error: (res2 as any).error }
        }
        return { ok: true, fallback: true, provider: 'resend' }
      } catch (e2) {
        console.error('[sendInviteEmail] Fallback send failed:', e2)
        return { ok: false, error: e2 }
      }
    }
    return { ok: true, provider: 'resend' }
  } catch (e) {
    console.error('[sendInviteEmail] Resend send failed:', e)
    // Fallback to verified Resend sender if general failure
    try {
      const res2 = await resend.emails.send({ from: 'onboarding@resend.dev', to, subject, html })
      if ((res2 as any)?.error) {
        console.error('[sendInviteEmail] Fallback error:', (res2 as any).error)
        return { ok: false, error: (res2 as any).error }
      }
      return { ok: true, fallback: true, provider: 'resend' }
    } catch (e2) {
      console.error('[sendInviteEmail] Fallback send failed:', e2)
      return { ok: false, error: e2 }
    }
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
