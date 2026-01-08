import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth';
import { Resend } from 'resend'
import { getAdminClient } from '@/lib/leadgen/supabaseServer';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type EmailItem = { lead_id: string; to?: string; subject: string; body: string; defaults?: Record<string, any> }

export async function POST(req: NextRequest) {
  try {
    await requireRoles(['admin', 'owner']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { channel, items } = await req.json()
    console.log(`[Outreach API] Received request for channel: ${channel}, items count: ${items?.length}`);
    
    if (!channel || !Array.isArray(items)) {
      console.error('[Outreach API] Invalid payload:', { channel, items });
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supa = getAdminClient();

    if (channel === 'email') {
      const resendKey = process.env.RESEND_API_KEY
      const brevoKey = process.env.BREVO_API_KEY
      const fromEmail = process.env.OUTREACH_FROM || process.env.CONTACT_FROM || 'outreach@tylerlundin.me'
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tylerlundin.me'
      const sent: string[] = []
      const failed: { lead_id: string; error: string }[] = []

      console.log(`[Outreach API] Email Config - Provider: ${brevoKey ? 'Brevo' : resendKey ? 'Resend' : 'Simulation'}, From: ${fromEmail}`);

      for (const raw of items as (EmailItem & { ctaLink?: string, useBranding?: boolean })[]) {
        const to = (raw.to || '').trim()
        const subject = String(raw.subject || '').trim()
        
        console.log(`[Outreach API] Processing item for lead ${raw.lead_id} - To: ${to}, Subject: ${subject}`);
        
        let html = '';
        if (raw.useBranding) {
          // Professional Branded Template
          html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; background-color: #ffffff;">
              <div style="margin-bottom: 32px;">
                <img src="${siteUrl}/images/tyler.png" alt="Tyler Lundin" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid #f0f0f0;" />
              </div>
              
              <div style="font-size: 16px; line-height: 1.6; color: #374151;">
                ${(raw.body || '').replace(/\n/g, '<br/>')}
              </div>

              ${raw.ctaLink ? `
                <div style="margin-top: 32px; margin-bottom: 32px;">
                  <a href="${raw.ctaLink}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    Access Your Private Portal
                  </a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                  Button not working? Copy this link: <br/>
                  <a href="${raw.ctaLink}" style="color: #3b82f6;">${raw.ctaLink}</a>
                </p>
              ` : ''}

              <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #f3f4f6;">
                <p style="font-size: 14px; font-weight: bold; margin: 0; color: #111827;">Tyler Lundin</p>
                <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">Freelance Web Developer • Spokane, WA</p>
                <p style="font-size: 12px; margin: 12px 0 0 0;">
                  <a href="${siteUrl}" style="color: #3b82f6; text-decoration: none;">tylerlundin.me</a>
                </p>
              </div>
            </div>
          `;
        } else {
          // Standard Simple Template
          html = `<div style="white-space:pre-wrap; font-family: -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.55">${
            (raw.body || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          }</div>`
        }

        if (!to || !subject || !raw.body) {
          failed.push({ lead_id: raw.lead_id, error: 'Missing to/subject/body' })
          continue
        }

        try {
          if (brevoKey) {
            console.log('[Outreach API] Sending via Brevo...');
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'api-key': brevoKey },
              body: JSON.stringify({ 
                sender: { email: fromEmail, name: 'Tyler Lundin' }, 
                to: [{ email: to }], 
                subject, 
                htmlContent: html 
              }),
            })
            if (!res.ok) {
              const text = await res.text().catch(() => '')
              console.error(`[Outreach API] Brevo error ${res.status}: ${text}`);
              throw new Error(`Brevo ${res.status}: ${text}`)
            }
            console.log('[Outreach API] Brevo send success');
          } else if (resendKey) {
            console.log('[Outreach API] Sending via Resend...');
            const resend = new Resend(resendKey)
            const result = await resend.emails.send({ from: fromEmail, to, subject, html })
            if (result.error) {
              console.error('[Outreach API] Resend error:', result.error);
              throw new Error(result.error.message);
            }
            console.log('[Outreach API] Resend send success', result.data?.id);
          } else {
            console.log('[Outreach API] Simulation - no API key found for Brevo or Resend');
          }
          sent.push(raw.lead_id)

          // Log success event
          if (supa) {
            const { error: eventError } = await supa.from('lead_events').insert({
              lead_id: raw.lead_id,
              type: 'outreach_sent',
              payload: { 
                channel: 'email', 
                to, 
                subject,
                body: raw.body,
                ctaLink: raw.ctaLink
              }
            });
            if (eventError) console.error('[Outreach API] Error logging event:', eventError);
            
            // Also update last_contacted_at
            const { error: updateError } = await supa.from('leads').update({ last_contacted_at: new Date().toISOString() }).eq('id', raw.lead_id);
            if (updateError) console.error('[Outreach API] Error updating last_contacted_at:', updateError);
          }
        } catch (e: any) {
          console.error(`[Outreach API] Exception sending to ${to}:`, e);
          failed.push({ lead_id: raw.lead_id, error: e?.message || 'send failed' })
        }
      }

      return NextResponse.json({ ok: true, sent, failed })
    }

    if (channel === 'sms') {
      const sent: string[] = []
      const failed: { lead_id: string; error: string }[] = []

      for (const raw of items) {
        const to = (raw.to || '').trim()
        const body = (raw.body || '').trim()

        if (!to || !body) {
          failed.push({ lead_id: raw.lead_id, error: 'Missing to/body' })
          continue
        }

        try {
          // Log simulation for now since no SMS key is provided
          console.log('[Outreach SMS simulation]', { to, body })
          
          sent.push(raw.lead_id)

          // Log success event
          if (supa) {
            await supa.from('lead_events').insert({
              lead_id: raw.lead_id,
              type: 'outreach_sent',
              payload: { 
                channel: 'sms', 
                to, 
                body,
                ctaLink: raw.ctaLink
              }
            });

            // Also update last_contacted_at
            await supa.from('leads').update({ last_contacted_at: new Date().toISOString() }).eq('id', raw.lead_id);
          }
        } catch (e: any) {
          failed.push({ lead_id: raw.lead_id, error: e?.message || 'send failed' })
        }
      }

      return NextResponse.json({ ok: true, sent, failed })
    }

    return NextResponse.json({ error: 'Unsupported channel' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}
