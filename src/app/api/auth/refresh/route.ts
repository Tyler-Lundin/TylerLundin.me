import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function hashToken(t: string) {
  return crypto.createHash('sha256').update(t).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const sb = await createServiceClient()
    const cookies = (req as any).cookies || new Map<string, string>()
    const refresh = req.cookies.get(REFRESH_COOKIE)?.value || ''
    if (!refresh) return NextResponse.json({ ok: false, code: 'no_refresh' }, { status: 401 })

    const refreshHash = hashToken(refresh)
    const { data: row } = await sb
      .from('auth_refresh_tokens')
      .select('id,user_id,expires_at,revoked_at')
      .eq('token_hash', refreshHash)
      .maybeSingle()
    if (!row || row.revoked_at || (row.expires_at && new Date(row.expires_at) < new Date())) {
      return NextResponse.json({ ok: false, code: 'invalid_refresh' }, { status: 401 })
    }

    // Load user's role to embed in access token
    const { data: user } = await sb.from('users').select('id, role').eq('id', row.user_id).maybeSingle()

    // Rotate refresh token
    const ua = req.headers.get('user-agent') || null
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0]?.trim() || null
    const newRt = crypto.randomBytes(32).toString('base64url')
    const newHash = hashToken(newRt)
    const rtExp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await sb.from('auth_refresh_tokens').update({ revoked_at: new Date().toISOString() }).eq('id', row.id)
    await sb.from('auth_refresh_tokens').insert({ user_id: row.user_id, token_hash: newHash, expires_at: rtExp.toISOString(), user_agent: ua, ip })

    // Issue new access token (1 hour)
    const accessExpSec = Math.floor(Date.now() / 1000) + 60 * 60
    const accessToken = jwt.sign({ sub: row.user_id, role: user?.role || 'member', exp: accessExpSec }, JWT_SECRET)
    const res = NextResponse.json({ ok: true })
    res.cookies.set({ name: ACCESS_COOKIE, value: accessToken, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 })
    res.cookies.set({ name: REFRESH_COOKIE, value: newRt, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 30 * 24 * 60 * 60 })
    return res
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'server_error' }, { status: 500 })
  }
}
