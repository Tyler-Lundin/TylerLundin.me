import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'

function hashToken(t: string) { return crypto.createHash('sha256').update(t).digest('hex') }

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true })
  try {
    const sb = await createServiceClient()
    const rt = req.cookies.get(REFRESH_COOKIE)?.value || ''
    if (rt) {
      const h = hashToken(rt)
      await sb.from('auth_refresh_tokens').update({ revoked_at: new Date().toISOString() }).eq('token_hash', h)
    }
  } catch {}
  res.cookies.set({ name: ACCESS_COOKIE, value: '', httpOnly: true, maxAge: 0, path: '/', sameSite: 'strict' })
  res.cookies.set({ name: REFRESH_COOKIE, value: '', httpOnly: true, maxAge: 0, path: '/', sameSite: 'strict' })
  return res
}
