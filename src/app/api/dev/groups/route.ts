import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { getAdminClient } from '@/lib/leadgen/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRoles(['admin', 'owner']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supa = getAdminClient();
  if (!supa) return NextResponse.json({ items: [] });
  const { data, error } = await supa.from('lead_groups').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    try {
      await requireRoles(['admin', 'owner']);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
    const supa = getAdminClient();
    if (!supa) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    const { data, error } = await supa
      .from('lead_groups')
      .insert({ name, description })
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
