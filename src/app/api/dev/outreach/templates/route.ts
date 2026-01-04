import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function requireAdminCookie() {
  return cookies().then((cookieStore) => {
    const token = cookieStore.get('access_token')?.value
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    if (!token) return { ok: false, status: 401 as const, error: 'Unauthorized' }
    try {
      const decoded = jwt.verify(token, secret) as any
      if (!decoded || decoded.role !== 'admin') return { ok: false, status: 403 as const, error: 'Forbidden' }
      return { ok: true as const }
    } catch (e) {
      return { ok: false, status: 401 as const, error: 'Unauthorized' }
    }
  })
}

export async function GET(req: NextRequest) {
  const admin = await requireAdminCookie()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
  try {
    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    const { searchParams } = new URL(req.url)
    const channel = searchParams.get('channel') || undefined
    const q = supa.from('outreach_templates').select('id,key,name,channel,subject,body,created_at,updated_at')
    const { data, error } = channel ? await q.eq('channel', channel) : await q
    if (error) throw error
    return NextResponse.json({ items: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminCookie()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
  try {
    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    const { key, name, channel, subject, body } = await req.json()
    if (!name || !channel || !body) return NextResponse.json({ error: 'name, channel, body required' }, { status: 400 })
    const payload: any = { key: key || null, name, channel, subject: subject || null, body }
    const { data, error } = await supa.from('outreach_templates').insert(payload).select('*').single()
    if (error) throw error
    return NextResponse.json({ item: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}
