import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/leadgen/supabaseServer';
import { getDetails, mapToLead, textSearchAll } from '@/lib/leadgen/google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { niches, locations, max = 100, dryRun = false } = await req.json();
    if (!Array.isArray(niches) || !niches.length || !Array.isArray(locations) || !locations.length) {
      return NextResponse.json({ error: 'niches and locations arrays are required' }, { status: 400 });
    }

    const supa = getAdminClient();
    const runsToLog: { niche: string; location: string; original_count: number; deduped_count: number; saved_count: number; dry_run: boolean }[] = [];

    const leads: any[] = [];
    const rawCounts = new Map<string, number>() // key: niche||location
    for (const niche of niches) {
      for (const location of locations) {
        const query = `${niche} in ${location}`;
        const results = await textSearchAll(query, Number(max));
        for (const r of results) {
          const details = await getDetails(r.place_id);
          const lead = mapToLead(details ?? r, niche, location);
          leads.push(lead);
          const key = `${niche}||${location}`
          rawCounts.set(key, (rawCounts.get(key) || 0) + 1)
        }
      }
    }

    // Dedupe by google_place_id within this batch to avoid intra-batch conflicts.
    const originalCount = leads.length;
    const map = new Map<string, any>();
    for (const l of leads) {
      if (!l?.google_place_id) continue;
      const existing = map.get(l.google_place_id);
      if (!existing) {
        map.set(l.google_place_id, l);
      } else {
        // Merge strategy: prefer existing values, but fill blanks; prefer higher user_ratings_total
        const pick = (a: any, b: any) => (a !== undefined && a !== null && a !== '' ? a : b);
        const merged = {
          ...existing,
          name: pick(existing.name, l.name),
          formatted_address: pick(existing.formatted_address, l.formatted_address),
          lat: pick(existing.lat, l.lat),
          lng: pick(existing.lng, l.lng),
          phone: pick(existing.phone, l.phone),
          website: pick(existing.website, l.website),
          domain: pick(existing.domain, l.domain),
          price_level: pick(existing.price_level, l.price_level),
          types: existing.types?.length ? existing.types : l.types,
          business_status: pick(existing.business_status, l.business_status),
          opening_hours: pick(existing.opening_hours, l.opening_hours),
          google_maps_url: pick(existing.google_maps_url, l.google_maps_url),
          data: pick(existing.data, l.data),
        };
        const er = existing.user_ratings_total ?? 0;
        const lr = l.user_ratings_total ?? 0;
        if (lr > er) {
          merged.user_ratings_total = l.user_ratings_total;
          merged.rating = l.rating ?? existing.rating;
        }
        map.set(l.google_place_id, merged);
      }
    }
    const deduped = Array.from(map.values());

    if (!supa) {
      return NextResponse.json({ error: 'Supabase not configured', count: deduped.length, originalCount, dedupedCount: deduped.length, leads: deduped }, { status: 200 });
    }

    // Build per-pair deduped counts from deduped array
    const dedupCounts = new Map<string, number>()
    for (const l of deduped) {
      const key = `${l.niche}||${l.location}`
      dedupCounts.set(key, (dedupCounts.get(key) || 0) + 1)
    }
    // Prepare one run per (niche, location)
    for (const [key, dCount] of dedupCounts.entries()) {
      const [n, loc] = key.split('||')
      const oCount = rawCounts.get(key) || dCount
      runsToLog.push({ niche: n, location: loc, original_count: oCount, deduped_count: dCount, saved_count: 0, dry_run: !!dryRun })
    }

    if (dryRun) {
      // Write run logs if applicable (saved_count is 0 for dryRun)
      if (runsToLog.length) {
        try {
          await supa.from('lead_search_runs').insert(runsToLog.map((r) => ({
            niche: r.niche,
            location: r.location,
            original_count: r.original_count,
            deduped_count: r.deduped_count,
            saved_count: 0,
            dry_run: true,
            finished_at: new Date().toISOString(),
          })) as any)
        } catch {}
      }
      return NextResponse.json({ count: deduped.length, originalCount, dedupedCount: deduped.length, leads: deduped });
    }

    // Chunked upsert to avoid payload limits and reduce lock contention
    const chunkSize = 500;
    let total = 0;
    const noWebsitePlaceIds = new Set<string>(deduped.filter((l: any) => !l.website).map((l: any) => l.google_place_id));
    const upsertedIdsNoWebsite: string[] = [];
    for (let i = 0; i < deduped.length; i += chunkSize) {
      const chunk = deduped.slice(i, i + chunkSize);
      const { data, error } = await supa
        .from('leads')
        .upsert(chunk, { onConflict: 'google_place_id', ignoreDuplicates: false })
        .select('id, google_place_id');
      if (error) throw error;
      const rows = data || [];
      total += rows.length;
      for (const row of rows) {
        if (row.google_place_id && noWebsitePlaceIds.has(row.google_place_id)) upsertedIdsNoWebsite.push(row.id);
      }
    }

    // Log non-dry run stats (saved_count approximated as deduped_count attempted)
    if (runsToLog.length) {
      try {
        await supa.from('lead_search_runs').insert(runsToLog.map((r) => ({
          niche: r.niche,
          location: r.location,
          original_count: r.original_count,
          deduped_count: r.deduped_count,
          saved_count: r.deduped_count,
          dry_run: false,
          finished_at: new Date().toISOString(),
        })) as any)
      } catch {}
    }

    // Ensure "No Website" group exists and add members
    try {
      const { data: group } = await supa.from('lead_groups').select('id').eq('name', 'No Website').maybeSingle();
      let groupId = group?.id as string | undefined;
      if (!groupId) {
        const { data: created } = await supa.from('lead_groups').insert({ name: 'No Website', description: 'Leads without a website' } as any).select('id').single();
        groupId = created?.id;
      }
      if (groupId && upsertedIdsNoWebsite.length) {
        const members = upsertedIdsNoWebsite.map((id) => ({ group_id: groupId!, lead_id: id }));
        await supa.from('lead_group_members').upsert(members as any, { onConflict: 'group_id, lead_id', ignoreDuplicates: true });
      }
    } catch {}
    return NextResponse.json({ count: total, originalCount, dedupedCount: deduped.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
