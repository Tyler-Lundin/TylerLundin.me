import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth';
import { getAdminClient } from '@/lib/leadgen/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireRoles(['admin', 'owner']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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
  try {
    await requireRoles(['admin', 'owner']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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
