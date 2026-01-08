import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { getAdminClient } from '@/lib/leadgen/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RankedGroup = {
  group_id: string;
  name: string;
  lead_count: number;
  score: number; // higher is better per our heuristic
  breakdown: { zero: number; s1_20: number; s21_50: number; g50: number };
};

function scoreForReviews(total: number | null): number {
  if (!total || total <= 0) return 0.5; // not enough reviews → bad
  if (total >= 1 && total <= 20) return 3; // sweet spot
  if (total >= 21 && total <= 50) return 2; // okay
  return 0.5; // 50+ → hard to convert
}

export async function GET(_req: NextRequest) {
  try {
    try {
      await requireRoles(['admin', 'owner']);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supa = getAdminClient();
    if (!supa) return NextResponse.json({ items: [] });

    // Pull group list and members with review counts in two calls for performance
    const [{ data: groupsRes, error: gErr }, { data: membersRes, error: mErr }] = await Promise.all([
      supa.from('lead_groups').select('id,name').order('created_at', { ascending: false }),
      supa.from('lead_group_members').select('group_id, leads(id,user_ratings_total)').limit(10000),
    ]);
    if (gErr) throw gErr;
    if (mErr) throw mErr;

    const groups = new Map<string, { name: string }>();
    (groupsRes || []).forEach((g: any) => groups.set(g.id, { name: g.name }));

    const agg = new Map<string, { name: string; lead_count: number; sumScore: number; breakdown: RankedGroup['breakdown'] }>();
    (membersRes || []).forEach((row: any) => {
      const gid: string = row.group_id;
      const name = groups.get(gid)?.name || 'Group';
      const total = row.leads?.user_ratings_total as number | null;
      const s = scoreForReviews(typeof total === 'number' ? total : null);
      const entry = agg.get(gid) || { name, lead_count: 0, sumScore: 0, breakdown: { zero: 0, s1_20: 0, s21_50: 0, g50: 0 } };
      entry.lead_count += 1;
      entry.sumScore += s;
      if (!total || total <= 0) entry.breakdown.zero += 1;
      else if (total <= 20) entry.breakdown.s1_20 += 1;
      else if (total <= 50) entry.breakdown.s21_50 += 1;
      else entry.breakdown.g50 += 1;
      agg.set(gid, entry);
    });

    const ranked: RankedGroup[] = Array.from(agg.entries()).map(([group_id, v]) => ({
      group_id,
      name: v.name,
      lead_count: v.lead_count,
      score: v.lead_count > 0 ? v.sumScore / v.lead_count : 0,
      breakdown: v.breakdown,
    }));

    ranked.sort((a, b) => b.score - a.score || b.lead_count - a.lead_count);

    return NextResponse.json({ items: ranked });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to rank groups' }, { status: 500 });
  }
}

