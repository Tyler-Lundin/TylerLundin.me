import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email, passwords } = await request.json()
    if (!email || !Array.isArray(passwords) || passwords.length !== 3) {
      return NextResponse.json({ success: false, code: 'invalid_format', message: 'Email and 3 passwords are required' }, { status: 400 })
    }

    const sb = await createServiceClient()
    // Look up user by email
    const { data: user, error: userErr } = await sb.from('users').select('id,email,role').ilike('email', String(email)).maybeSingle()
    if (userErr) {
      return NextResponse.json({ success: false, code: 'database_error', message: 'Database error', error: userErr.message }, { status: 500 })
    }
    if (!user) {
      return NextResponse.json({ success: false, code: 'no_user', message: 'User not found' }, { status: 401 })
    }

    // Load credentials for user
    const { data: cred, error: credErr } = await sb
      .from('team_credentials')
      .select('password_1_hash, password_2_hash, password_3_hash')
      .eq('user_id', user.id)
      .maybeSingle()
    if (credErr) {
      return NextResponse.json({ success: false, code: 'database_error', message: 'Database error', error: credErr.message }, { status: 500 })
    }
    if (!cred) {
      return NextResponse.json({ success: false, code: 'no_credentials', message: 'No credentials found for user' }, { status: 401 })
    }

    const ok1 = await bcrypt.compare(passwords[0], cred.password_1_hash)
    const ok2 = await bcrypt.compare(passwords[1], cred.password_2_hash)
    const ok3 = await bcrypt.compare(passwords[2], cred.password_3_hash)
    if (!ok1 || !ok2 || !ok3) {
      return NextResponse.json({ success: false, code: 'invalid_credentials', message: 'Invalid credentials' }, { status: 401 })
    }

    const role = user.role || 'member'
    // Access token 15m
    const accessExpSec = Math.floor(Date.now() / 1000) + 15 * 60
    const accessToken = jwt.sign({ sub: user.id, email: user.email, role, exp: accessExpSec }, JWT_SECRET)
    // Refresh token 30d (random, stored hashed)
    const rt = crypto.randomBytes(32).toString('base64url')
    const rtHash = crypto.createHash('sha256').update(rt).digest('hex')
    const rtExp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const ua = (request.headers.get('user-agent') || null) as any
    const ip = ((request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '') as string).split(',')[0]?.trim() || null
    await sb.from('auth_refresh_tokens').insert({ user_id: user.id, token_hash: rtHash, expires_at: rtExp.toISOString(), user_agent: ua, ip })
    const response = NextResponse.json({ success: true, code: 'success', message: 'Authentication successful', role })
    response.cookies.set({ name: ACCESS_COOKIE, value: accessToken, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 15 * 60 })
    response.cookies.set({ name: REFRESH_COOKIE, value: rt, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 30 * 24 * 60 * 60 })
    return response
  } catch (e: any) {
    return NextResponse.json({ success: false, code: 'server_error', message: e?.message || 'Internal server error' }, { status: 500 })
  }
}
