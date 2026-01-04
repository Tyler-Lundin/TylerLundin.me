import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/leadgen/supabaseServer';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Admin guard
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { lead_id, filter_key = 'website_swipe', decision, reason, group_id } = await req.json();
    if (!lead_id || !decision) return NextResponse.json({ error: 'lead_id and decision required' }, { status: 400 });
    if (!['keep', 'reject', 'skip'].includes(decision)) return NextResponse.json({ error: 'invalid decision' }, { status: 400 });

    const supa = getAdminClient();
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    // Record decision
    const { data: rec, error } = await supa
      .from('lead_filter_results')
      .insert({ lead_id, filter_key, decision, reason })
      .select('id')
      .maybeSingle();
    if (error) throw error;

    // Add to group if provided and decision is keep
    let grouped = false;
    if (group_id && decision === 'keep') {
      const { error: gerr } = await supa.from('lead_group_members').insert({ group_id, lead_id });
      if (!gerr) grouped = true;
    }

    return NextResponse.json({ ok: true, id: rec?.id, grouped });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
