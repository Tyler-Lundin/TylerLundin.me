import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { getAdminClient } from '@/lib/leadgen/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Admin guard
    try {
      await requireRoles(['admin', 'owner']);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(1000, Math.max(1, Number(searchParams.get('limit') || '10')));
    const offset = Math.max(0, Number(searchParams.get('offset') || '0'));

    const supa = getAdminClient();
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    // Get total count
    const { count: total, error: cntErr } = await supa
      .from('lead_group_members')
      .select('lead_id', { count: 'exact', head: true })
      .eq('group_id', id);
    if (cntErr) throw cntErr;

    // Get latest members with lead details
    const { data, error } = await supa
      .from('lead_group_members')
      .select('lead_id, added_at, leads(id,name,niche,location,website,domain,formatted_address,phone,rating,user_ratings_total,google_maps_url)')
      .eq('group_id', id)
      .order('added_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;

    const items = data || []
    const leadIds = Array.from(new Set(items.map((r: any) => r.lead_id).filter(Boolean)))
    let clientsByLead = new Map<string, { id: string }>()
    let activeProjectByClient = new Map<string, { id: string; slug: string }>()

    if (leadIds.length) {
      // Fetch clients keyed by lead_id
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

    return NextResponse.json({ total: total ?? 0, items: enriched });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
