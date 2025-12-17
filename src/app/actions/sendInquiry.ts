"use server";

import { Resend } from 'resend';
import { cookies, headers } from 'next/headers';

// Simple in-memory rate limiter per IP (best-effort in serverless)
type Rate = { count: number; first: number; last: number };
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX_COUNT = 3; // max messages per IP per window
const rateMap: Map<string, Rate> = new Map();

async function getClientIp(): Promise<string> {
  // In Next 15, headers() can be async in Server Actions
  const h: any = await (headers() as unknown as Promise<Headers>);
  const xff = (h.get('x-forwarded-for') || '').split(',')[0]?.trim();
  return (
    xff ||
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    h.get('x-client-ip') ||
    'unknown'
  );
}

function rateLimitCheck(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry) {
    rateMap.set(ip, { count: 1, first: now, last: now });
    return true;
  }
  // Reset window
  if (now - entry.first > RATE_WINDOW_MS) {
    rateMap.set(ip, { count: 1, first: now, last: now });
    return true;
  }
  if (entry.count >= RATE_MAX_COUNT) return false;
  entry.count += 1;
  entry.last = now;
  return true;
}

type InquiryPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  projectType?: string[];
  description: string;
  budget?: string;
  budgetRange?: string;
  timeline?: string;
  heardFrom?: string;
  preferredContact?: string;
  topic?: string;
  consent?: string;
  pagesEstimate?: string;
  features?: string[];
  ongoingHelp?: string;
  assets?: string[];
  exampleLinks?: string[];
  notes?: string;
  // Anti-spam fields
  nickname?: string; // honeypot (should be empty)
  elapsedMs?: string; // time spent on form
  csrf_token?: string; // double-submit cookie token
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
    budgetRange: sanitize(formData.get('budgetRange') as string),
    timeline: sanitize(formData.get('timeline') as string),
    heardFrom: sanitize(formData.get('heardFrom') as string),
    preferredContact: sanitize(formData.get('preferredContact') as string),
    topic: sanitize(formData.get('topic') as string),
    consent: sanitize(formData.get('consent') as string),
    pagesEstimate: sanitize(formData.get('pagesEstimate') as string),
    features: (formData.getAll('features') as string[] | null) || undefined,
    ongoingHelp: sanitize(formData.get('ongoingHelp') as string),
    assets: (formData.getAll('assets') as string[] | null) || undefined,
    exampleLinks: (formData.getAll('exampleLinks') as string[] | null) || undefined,
    notes: sanitize(formData.get('notes') as string),
    nickname: sanitize(formData.get('nickname') as string),
    elapsedMs: sanitize(formData.get('elapsedMs') as string),
    csrf_token: sanitize(formData.get('csrf_token') as string),
  };

  // Basic validation
  if (!payload.name || !payload.email || !payload.description) {
    return { ok: false, message: 'Missing required fields.' };
  }

  // Server-side email validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!emailRe.test(payload.email)) {
    return { ok: false, message: 'Please provide a valid email.' };
  }

  // CSRF: double-submit cookie validation (cookies() is async in Server Actions)
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get('csrf_token')?.value;
  if (!csrfCookie || !payload.csrf_token || csrfCookie !== payload.csrf_token) {
    return { ok: false, message: 'Security check failed. Refresh and try again.' };
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

  // Lightweight rate limiting per IP
  const ip = await getClientIp();
  if (!rateLimitCheck(ip)) {
    return { ok: true, message: 'Thanks! (rate limited)' };
  }

  // Content heuristics: limit links and obvious spam terms
  const text = `${payload.description} ${payload.company || ''}`.toLowerCase();
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  const spamTerms = ['viagra', 'casino', 'loan', 'bitcoin', 'investment scheme'];
  if (urlCount > 3 || spamTerms.some((t) => text.includes(t))) {
    return { ok: true, message: 'Thanks!' };
  }

  const toEmail = process.env.CONTACT_TO || process.env.NEXT_PUBLIC_CONTACT_TO || 'msg@tylerlundin.me';
  const fromEmail = process.env.CONTACT_FROM || 'inquiry@tylerlundin.me';
  const resendKey = process.env.RESEND_API_KEY;
  const brevoKey = process.env.BREVO_API_KEY; // aka Sendinblue

  const subject = `New inquiry from ${payload.name}`;
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.6; color:#111">
      <h2 style="margin:0 0 8px 0">New Inquiry</h2>
      <p style="margin:0 0 12px 0; color:#444">Submitted via website</p>
      <table style="border-collapse:collapse; width:100%" cellpadding="6" border="0">
        <tr><td><b>Name</b></td><td>${payload.name}</td></tr>
        <tr><td><b>Email</b></td><td>${payload.email}</td></tr>
        ${payload.phone ? `<tr><td><b>Phone</b></td><td>${payload.phone}</td></tr>` : ''}
        ${payload.company ? `<tr><td><b>Company</b></td><td>${payload.company}</td></tr>` : ''}
        ${payload.website ? `<tr><td><b>Website</b></td><td>${payload.website}</td></tr>` : ''}
        ${payload.projectType?.length ? `<tr><td><b>Project Type</b></td><td>${payload.projectType.join(', ')}</td></tr>` : ''}
        ${payload.pagesEstimate ? `<tr><td><b>Pages</b></td><td>${payload.pagesEstimate}</td></tr>` : ''}
        ${payload.features?.length ? `<tr><td><b>Features</b></td><td>${payload.features.join(', ')}</td></tr>` : ''}
        ${payload.timeline ? `<tr><td><b>Timeline</b></td><td>${payload.timeline}</td></tr>` : ''}
        ${payload.budgetRange || payload.budget ? `<tr><td><b>Budget</b></td><td>${payload.budgetRange || payload.budget}</td></tr>` : ''}
        ${payload.ongoingHelp ? `<tr><td><b>Ongoing Help</b></td><td>${payload.ongoingHelp}</td></tr>` : ''}
        ${payload.assets?.length ? `<tr><td><b>Assets</b></td><td>${payload.assets.join(', ')}</td></tr>` : ''}
        ${payload.preferredContact ? `<tr><td><b>Preferred Contact</b></td><td>${payload.preferredContact}</td></tr>` : ''}
        ${payload.topic ? `<tr><td><b>Topic</b></td><td>${payload.topic}</td></tr>` : ''}
        ${payload.heardFrom ? `<tr><td><b>Heard From</b></td><td>${payload.heardFrom}</td></tr>` : ''}
      </table>
      <h3 style="margin:16px 0 8px 0">Message / Notes</h3>
      <div style="white-space:pre-wrap;">${payload.description || payload.notes || ''}</div>
      ${payload.exampleLinks?.length ? `<div style="margin-top:12px"><b>Examples:</b> ${payload.exampleLinks.join(', ')}</div>` : ''}
      <hr style="margin:16px 0; border:none; border-top:1px solid #eee" />
      <div style="color:#666; font-size:12px">Time on form: ${elapsed}ms • Consent: ${payload.consent === 'true' ? 'Yes' : 'No'}</div>
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
