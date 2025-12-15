import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase: any = await createServiceClient()
  const { searchParams } = new URL(req.url)
  const topicId = searchParams.get('topicId')?.trim()
  const q = searchParams.get('q')?.trim()
  const limit = Number(searchParams.get('limit') || '20')
  const includeExpired = searchParams.get('includeExpired') === 'true'

  // Gather facet filters: facet.* in query
  const facetEntries: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('facet.')) {
      const k = key.slice('facet.'.length)
      if (k && value) facetEntries[k] = value
    }
  }

  let query = supabase.from('ankr_snippets').select('*')
  if (topicId) query = query.eq('topic_id', topicId)
  if (!includeExpired) {
    const nowIso = new Date().toISOString()
    // include non-expiring OR future-expiring
    query = query.or(`expires_at.is.null,expires_at.gt.${nowIso}`)
  }
  if (Object.keys(facetEntries).length > 0) {
    query = query.contains('facets', facetEntries)
  }
  if (q && q.length > 0) {
    const like = `%${q}%`
    query = query.or(`content.ilike.${like},source_ref.ilike.${like}`)
  }
  const { data, error } = await query
    .order('weight', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(1, limit), 200))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase: any = await createServiceClient()
  const body = await req.json().catch(() => ({}))
  const { topicId, sourceKind, sourceRef, content, meta, facets, private: isPrivate, weight, expiresAt, supersedesId } = body || {}
  if (!topicId || !sourceKind || !content) return NextResponse.json({ error: 'topicId, sourceKind, content are required' }, { status: 400 })

  const row = {
    topic_id: topicId,
    source_kind: sourceKind,
    source_ref: sourceRef ?? null,
    content,
    meta: meta ?? {},
    facets: facets ?? {},
    private: isPrivate ?? true,
    weight: typeof weight === 'number' ? weight : 0,
    expires_at: expiresAt ?? null,
    supersedes_id: supersedesId ?? null,
  }
  const { data, error } = await supabase.from('ankr_snippets').insert([row]).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

