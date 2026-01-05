import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import jwt from 'jsonwebtoken'
import { createServiceClient } from '@/lib/supabase/server'
import { requireRoles } from '@/lib/auth'

const COOKIE_NAME = 'access_token'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Gate to trusted roles
  try {
    await requireRoles(['admin', 'head_of_marketing', 'head of marketing'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value || null

  let decoded: any = null
  let error: string | null = null
  try {
    if (token) decoded = jwt.verify(token, JWT_SECRET)
  } catch (e: any) {
    error = e?.message || String(e)
  }

  const claims: any = decoded || {}
  const derivedId =
    claims.id || claims.sub || claims.user_id || claims.userId || claims.uid || null
  const email = claims.email || claims.user_email || null

  // Check DB presence
  const sb: any = await createServiceClient()
  let usersRow: any = null
  let profileRow: any = null
  try {
    if (derivedId) {
      const { data: u } = await sb.from('users').select('id,email,role').eq('id', String(derivedId)).maybeSingle()
      usersRow = u || null
    } else if (email) {
      const { data: u } = await sb.from('users').select('id,email,role').ilike('email', String(email)).maybeSingle()
      usersRow = u || null
    }
    if (usersRow?.id) {
      const { data: p } = await sb.from('user_profiles').select('user_id,visibility').eq('user_id', usersRow.id).maybeSingle()
      profileRow = p || null
    }
  } catch {}

  const h = await headers()
  const ua = h.get('user-agent') || null
  const xff = (h.get('x-forwarded-for') || '').split(',')[0]?.trim() || null

  return NextResponse.json({
    ok: true,
    cookiePresent: !!token,
    tokenLen: token?.length || 0,
    decodeError: error,
    decodedKeys: decoded ? Object.keys(decoded) : [],
    decoded: decoded || null,
    derivedId,
    email,
    usersRow: usersRow ? { id: usersRow.id, email: usersRow.email, role: usersRow.role } : null,
    profileRow,
    request: { ip: xff, ua },
  })
}

