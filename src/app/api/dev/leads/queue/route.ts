import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/leadgen/supabaseServer';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Admin guard
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const filterKey = searchParams.get('filter') || 'website_swipe';
    const limit = Number(searchParams.get('limit') || '1');

    const supa = getAdminClient();
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    // Fetch already reviewed lead ids for this filter
    const { data: reviewedRows, error: reviewedError } = await supa
      .from('lead_filter_results')
      .select('lead_id')
      .eq('filter_key', filterKey)
      .limit(5000);
    if (reviewedError) throw reviewedError;
    const reviewedIds = Array.from(new Set((reviewedRows || []).map((r: any) => r.lead_id)));

    // Auto-keep: if a lead has no website and hasn't been reviewed, mark keep(no website)
    try {
      let nullQ = supa
        .from('leads')
        .select('id')
        .is('website', null)
        .limit(200);
      if (reviewedIds.length > 0) {
        const list = `(${reviewedIds.map((id) => `"${id}"`).join(',')})`;
        nullQ = nullQ.not('id', 'in', list);
      }
      const { data: nullLeads, error: nullErr } = await nullQ;
      if (!nullErr && nullLeads && nullLeads.length > 0) {
        const inserts = nullLeads.map((r: any) => ({ lead_id: r.id, filter_key: filterKey, decision: 'keep', reason: 'no website' }));
        await supa.from('lead_filter_results').insert(inserts);
        // Ensure "No Website" group exists and add these
        try {
          const { data: group } = await supa.from('lead_groups').select('id').eq('name', 'No Website').maybeSingle();
          let groupId = group?.id as string | undefined;
          if (!groupId) {
            const { data: created } = await supa.from('lead_groups').insert({ name: 'No Website', description: 'Leads without a website' } as any).select('id').single();
            groupId = created?.id;
          }
          if (groupId) {
            const members = (nullLeads || []).map((r: any) => ({ group_id: groupId!, lead_id: r.id }));
            await supa.from('lead_group_members').upsert(members as any, { onConflict: 'group_id, lead_id', ignoreDuplicates: true });
          }
        } catch {}
        // Augment reviewed set to avoid recount fetch below
        for (const r of nullLeads) reviewedIds.push(r.id);
      }
    } catch {}

    // Build base leads query: prefer website presence for this filter
    let q = supa
      .from('leads')
      .select('id,name,website,formatted_address,phone,rating,user_ratings_total,google_maps_url')
      .not('website', 'is', null)
      .order('user_ratings_total', { ascending: false })
      .limit(limit);

    if (reviewedIds.length > 0) {
      // PostgREST expects a parenthesized list for in()
      const list = `(${reviewedIds.map((id) => `"${id}"`).join(',')})`;
      q = q.not('id', 'in', list);
    }

    const { data: leads, error } = await q;
    if (error) throw error;

    // Also return a quick count of remaining to review (rough; caps reviewed list)
    const { count } = await supa
      .from('leads')
      .select('id', { count: 'estimated', head: true })
      .not('website', 'is', null);

    return NextResponse.json({ filter: filterKey, items: leads || [], reviewedCount: reviewedIds.length, totalWithWebsite: count ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
