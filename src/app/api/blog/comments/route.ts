import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

function isRecentEnough(startedAt?: string) {
  if (!startedAt) return false
  const start = new Date(startedAt).getTime()
  const now = Date.now()
  const delta = now - start
  return delta >= 5000 && delta <= 60 * 60 * 1000 // between 5s and 1h
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { post_id, author_name, author_email, website_url, content, hp, startedAt } = body || {}

    // Honeypot
    if (typeof hp === 'string' && hp.trim().length > 0) {
      return NextResponse.json({ ok: true })
    }

    if (!post_id || typeof content !== 'string' || content.trim().length < 5 || content.length > 4000) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Time-based check
    if (!isRecentEnough(startedAt)) {
      return NextResponse.json({ error: 'Suspicious timing' }, { status: 400 })
    }

    const h = await headers()
    const ua = h.get('user-agent') || ''
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
    const viewer_hash = Buffer.from(`${ip}|${ua}`).toString('base64').slice(0, 160)

    const sb: any = await createServiceClient()

    // Rate limit: same viewer + post in last 2 minutes
    const { count: recentCount } = await sb
      .from('blog_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post_id)
      .eq('viewer_hash', viewer_hash)
      .gte('created_at', new Date(Date.now() - 2 * 60 * 1000).toISOString())

    if ((recentCount || 0) > 0) {
      return NextResponse.json({ error: 'Too many submissions' }, { status: 429 })
    }

    // Duplicate content in last 5 minutes
    const { count: dupCount } = await sb
      .from('blog_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post_id)
      .eq('content', content)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())

    if ((dupCount || 0) > 0) {
      return NextResponse.json({ error: 'Duplicate detected' }, { status: 409 })
    }

    const { error } = await sb.from('blog_comments').insert({
      post_id,
      author_name: author_name || null,
      author_email: author_email || null,
      website_url: website_url || null,
      content,
      status: 'pending',
      viewer_hash,
      user_agent: ua,
    })
    if (error) throw error

    // Fire-and-forget email notification via Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const to = process.env.CONTACT_TO || process.env.EMAIL_TO
      const from = process.env.CONTACT_FROM || process.env.EMAIL_FROM || 'comment@tylerlundin.me'

      // Get post info
      const { data: postInfo } = await sb
        .from('blog_posts')
        .select('slug,title')
        .eq('id', post_id)
        .maybeSingle()

      if (to && from) {
        await resend.emails.send({
          from,
          to,
          subject: `[Blog] New comment on ${postInfo?.title || postInfo?.slug || 'post'}`,
          html: `
            <h2>New Blog Comment</h2>
            <p><strong>Post:</strong> ${postInfo?.title || ''} (${postInfo?.slug || ''})</p>
            <p><strong>Author:</strong> ${author_name || 'Anonymous'}</p>
            ${author_email ? `<p><strong>Email:</strong> ${author_email}</p>` : ''}
            ${website_url ? `<p><strong>Website:</strong> ${website_url}</p>` : ''}
            <p><strong>Content:</strong></p>
            <pre style="white-space: pre-wrap; background: #f6f6f6; padding: 12px;">${content.replace(/</g, '&lt;')}</pre>
            <hr/>
            <p style="font-size:12px;color:#666">viewer_hash: ${viewer_hash}<br/>ua: ${ua}</p>
          `,
        })
      }
    } catch (e) {
      console.error('Resend email error', e)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Comment submit error', e)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
