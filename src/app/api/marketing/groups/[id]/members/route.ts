import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MARKETING_ROLES = new Set(['admin', 'head_of_marketing', 'head of marketing', 'marketing_editor', 'marketing_analyst'])

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = jwt.verify(token, secret) as any
    const role = decoded?.role
    if (!decoded || !MARKETING_ROLES.has(String(role))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const limit = Math.min(1000, Math.max(1, Number(searchParams.get('limit') || '10')))
    const offset = Math.max(0, Number(searchParams.get('offset') || '0'))

    const supa = getAdminClient()
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    const { count: total, error: cntErr } = await supa
      .from('lead_group_members')
      .select('lead_id', { count: 'exact', head: true })
      .eq('group_id', id)
    if (cntErr) throw cntErr

    const { data, error } = await supa
      .from('lead_group_members')
      .select('lead_id, added_at, leads(id,name,niche,location,website,domain,formatted_address,phone,rating,user_ratings_total,google_maps_url)')
      .eq('group_id', id)
      .order('added_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw error

    const items = data || []
    const leadIds = Array.from(new Set(items.map((r: any) => r.lead_id).filter(Boolean)))
    let clientsByLead = new Map<string, { id: string }>()
    let activeProjectByClient = new Map<string, { id: string; slug: string }>()

    if (leadIds.length) {
      const { data: clients } = await supa
        .from('crm_clients')
        .select('id, lead_id')
        .in('lead_id', leadIds)
      ;(clients || []).forEach((c: any) => { if (c?.lead_id) clientsByLead.set(c.lead_id as string, { id: c.id }) })
      const clientIds = Array.from(new Set((clients || []).map((c: any) => c.id))).filter(Boolean)
      if (clientIds.length) {
        const { data: projects } = await supa
          .from('crm_projects')
          .select('id, client_id, slug, status')
          .in('client_id', clientIds)
          .in('status', ['planned', 'in_progress'])
        ;(projects || []).forEach((p: any) => { if (p?.client_id) activeProjectByClient.set(p.client_id as string, { id: p.id, slug: p.slug }) })
      }
    }

    const enriched = items.map((row: any) => {
      const client = clientsByLead.get(row.lead_id)
      const project = client ? activeProjectByClient.get(client.id) : undefined
      return {
        ...row,
        has_client: !!client,
        has_active_project: !!project,
        client_id: client?.id || null,
        project_slug: project?.slug || null,
      }
    })

    return NextResponse.json({ total: total ?? 0, items: enriched })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}

