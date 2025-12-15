import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase: any = await createServiceClient()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const kind = searchParams.get('kind')?.trim()

  let query = supabase.from('ankr_topics').select('*')
  if (kind) query = query.eq('kind', kind)
  if (q && q.length > 0) {
    // Match against title or slug
    const like = `%${q}%`
    query = query.or(`title.ilike.${like},slug.ilike.${like}`)
  }
  const { data, error } = await query.order('updated_at', { ascending: false }).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase: any = await createServiceClient()
  const body = await req.json().catch(() => ({}))
  const { kind, slug, title, description, tags } = body || {}
  if (!kind || !slug || !title) return NextResponse.json({ error: 'kind, slug, title are required' }, { status: 400 })

  const { data, error } = await supabase
    .from('ankr_topics')
    .insert([{ kind, slug, title, description, tags: Array.isArray(tags) ? tags : [] }])
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
