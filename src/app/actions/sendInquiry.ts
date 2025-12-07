"use server";

import { Resend } from 'resend';

type InquiryPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  projectType?: string[];
  description: string;
  budget?: string;
  timeline?: string;
  heardFrom?: string;
  // Anti-spam fields
  nickname?: string; // honeypot (should be empty)
  elapsedMs?: string; // time spent on form
  challenge?: string; // simple math answer
};

function sanitize(input: string | undefined | null): string | undefined {
  if (!input) return undefined;
  return String(input).slice(0, 5000);
}

export async function sendInquiry(formData: FormData) {
  const payload: InquiryPayload = {
    name: sanitize(formData.get('name') as string) || '',
    email: sanitize(formData.get('email') as string) || '',
    phone: sanitize(formData.get('phone') as string),
    company: sanitize(formData.get('company') as string),
    website: sanitize(formData.get('website') as string),
    projectType: (formData.getAll('projectType') as string[] | null) || undefined,
    description: sanitize(formData.get('description') as string) || '',
    budget: sanitize(formData.get('budget') as string),
    timeline: sanitize(formData.get('timeline') as string),
    heardFrom: sanitize(formData.get('heardFrom') as string),
    nickname: sanitize(formData.get('nickname') as string),
    elapsedMs: sanitize(formData.get('elapsedMs') as string),
    challenge: sanitize(formData.get('challenge') as string),
  };

  // Basic validation
  if (!payload.name || !payload.email || !payload.description) {
    return { ok: false, message: 'Missing required fields.' };
  }

  // Anti-spam checks
  if (payload.nickname) {
    // Honeypot filled in
    return { ok: true, message: 'Thanks!' };
  }
  const elapsed = Number(payload.elapsedMs || '0');
  if (!Number.isFinite(elapsed) || elapsed < 2500) {
    return { ok: true, message: 'Thanks!' };
  }
  if ((payload.challenge || '').trim() !== '7') {
    return { ok: false, message: 'Challenge failed. Please try again.' };
  }

  const toEmail = process.env.CONTACT_TO || process.env.NEXT_PUBLIC_CONTACT_TO || 'msg@tylerlundin.me';
  const fromEmail = process.env.CONTACT_FROM || 'inquiry@tylerlundin.me';
  const resendKey = process.env.RESEND_API_KEY;
  const brevoKey = process.env.BREVO_API_KEY; // aka Sendinblue

  const subject = `New project inquiry from ${payload.name}`;
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.6; color:#111">
      <h2 style="margin:0 0 8px 0">New Project Inquiry</h2>
      <p style="margin:0 0 12px 0; color:#444">Submitted via contact wizard</p>
      <table style="border-collapse:collapse; width:100%" cellpadding="6" border="0">
        <tr><td><b>Name</b></td><td>${payload.name}</td></tr>
        <tr><td><b>Email</b></td><td>${payload.email}</td></tr>
        ${payload.phone ? `<tr><td><b>Phone</b></td><td>${payload.phone}</td></tr>` : ''}
        ${payload.company ? `<tr><td><b>Company</b></td><td>${payload.company}</td></tr>` : ''}
        ${payload.website ? `<tr><td><b>Website</b></td><td>${payload.website}</td></tr>` : ''}
        ${payload.projectType?.length ? `<tr><td><b>Project Type</b></td><td>${payload.projectType.join(', ')}</td></tr>` : ''}
        ${payload.budget ? `<tr><td><b>Budget</b></td><td>${payload.budget}</td></tr>` : ''}
        ${payload.timeline ? `<tr><td><b>Timeline</b></td><td>${payload.timeline}</td></tr>` : ''}
        ${payload.heardFrom ? `<tr><td><b>Heard From</b></td><td>${payload.heardFrom}</td></tr>` : ''}
      </table>
      <h3 style="margin:16px 0 8px 0">Project Description</h3>
      <div style="white-space:pre-wrap;">${payload.description}</div>
      <hr style="margin:16px 0; border:none; border-top:1px solid #eee" />
      <div style="color:#666; font-size:12px">Time on form: ${elapsed}ms</div>
    </div>
  `;

  try {
    if (brevoKey) {
      // Use Brevo transactional email API directly
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { email: fromEmail, name: payload.name || 'Website Inquiry' },
          to: [{ email: toEmail }],
          replyTo: payload.email ? { email: payload.email, name: payload.name } : undefined,
          subject,
          htmlContent: html,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Brevo error: ${res.status} ${text}`);
      }
    } else if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject,
        html,
        replyTo: payload.email,
      });
    } else {
      console.log('[Inquiry]', { subject, toEmail, payload });
    }
    return { ok: true, message: 'Inquiry sent. I will get back to you shortly.' };
  } catch (err) {
    console.error('sendInquiry error', err);
    return { ok: false, message: 'Failed to send. Please try again later.' };
  }
}
