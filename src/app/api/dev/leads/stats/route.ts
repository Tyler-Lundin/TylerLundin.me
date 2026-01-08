import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { getAdminClient } from '@/lib/leadgen/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Admin guard using Supabase Auth
    try {
      await requireRoles(['admin', 'owner']);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supa = getAdminClient();
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [leadsTotalRes, leadsWebYesRes, leadsWebNoRes, leadsTodayRes, groupsRes, groupMembersRes, latestMembersRes] = await Promise.all([
      supa.from('leads').select('id', { count: 'exact', head: true }),
      supa.from('leads').select('id', { count: 'exact', head: true }).not('website', 'is', null),
      supa.from('leads').select('id', { count: 'exact', head: true }).is('website', null),
      supa.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', since),
      supa.from('lead_groups').select('id', { count: 'exact', head: true }),
      supa.from('lead_group_members').select('lead_id', { count: 'exact', head: true }),
      supa
        .from('lead_group_members')
        .select('group_id, lead_groups(name)')
        .order('added_at', { ascending: false })
        .limit(1000),
    ]);

    const topCounts = new Map<string, { name: string; count: number }>();
    (latestMembersRes.data || []).forEach((row: any) => {
      const gid = row.group_id as string;
      const name = row.lead_groups?.name || 'Group';
      const prev = topCounts.get(gid) || { name, count: 0 };
      prev.count += 1;
      topCounts.set(gid, prev);
    });
    const topGroups = Array.from(topCounts.entries())
      .map(([group_id, v]) => ({ group_id, name: v.name, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totals: {
        leads: leadsTotalRes.count || 0,
        withWebsite: leadsWebYesRes.count || 0,
        withoutWebsite: leadsWebNoRes.count || 0,
        leads24h: leadsTodayRes.count || 0,
      },
      groups: {
        count: groupsRes.count || 0,
        members: groupMembersRes.count || 0,
      },
      topGroups,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Stats failed' }, { status: 500 });
  }
}
