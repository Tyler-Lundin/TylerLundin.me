import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')
  return new Resend(apiKey)
}

export async function POST(request: Request) {
  try {
    const { name, email, message, budget } = await request.json()

    // Lazy-init Supabase admin client with validation
    let supabase
    try {
      supabase = getSupabaseAdmin()
    } catch (e) {
      console.error('Supabase config error:', e)
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 503 }
      )
    }

    // Store submission
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert([{ name, email, message, budget }])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to store submission' },
        { status: 500 }
      )
    }

    // Lazy-init Resend with validation
    let resend
    try {
      resend = getResend()
    } catch (e) {
      console.error('Email config error:', e)
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 503 }
      )
    }

    const from = process.env.EMAIL_FROM
    const to = process.env.EMAIL_TO
    if (!from || !to) {
      console.error('Email addresses not configured (EMAIL_FROM/EMAIL_TO)')
      return NextResponse.json(
        { error: 'Email addresses are not configured' },
        { status: 503 }
      )
    }

    const { error: emailError } = await resend.emails.send({
      from,
      to,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    if (emailError) {
      console.error('Email error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
