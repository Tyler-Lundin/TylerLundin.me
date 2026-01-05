import { NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET() {
  try {
    await requireRoles(['admin', 'head_of_marketing', 'head of marketing'])
    const supabase: any = await createServiceClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image_url, status, updated_at, published_at, reading_time_minutes')
      .order('updated_at', { ascending: false })

    if (error) throw error
    const posts = Array.isArray(data) ? data : []
    const withCounts = [] as any[]
    for (const p of posts) {
      const { count } = await supabase
        .from('blog_post_views')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', p.id)
      withCounts.push({ ...p, views_count: count || 0 })
    }
    return NextResponse.json({ ok: true, posts: withCounts })
  } catch (err) {
    console.error('Posts GET error:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    await requireRoles(['admin', 'head_of_marketing', 'head of marketing'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase: any = await createServiceClient()
  try {
    const body = await req.json()
    const {
      id,
      title,
      slug,
      excerpt,
      content_md,
      content_json,
      cover_image_url,
      status = 'draft',
      tags = [] as string[],
      published_at,
      reading_time_minutes,
      meta,
    } = body

    const finalSlug = slug ? slugify(slug) : slugify(title || '')
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const upsertPayload: any = {
      title,
      slug: finalSlug,
      excerpt,
      content_md,
      content_json,
      cover_image_url,
      status,
      published_at,
      reading_time_minutes,
      meta,
    }
    if (id) upsertPayload.id = id

    const { data: post, error } = await supabase
      .from('blog_posts')
      .upsert(upsertPayload)
      .select('*')
      .single()

    if (error) throw error

    // Handle tags: ensure exist, then join
    if (Array.isArray(tags) && tags.length > 0) {
      const tagRows = tags.map((name: string) => ({ slug: slugify(name), name }))
      // Upsert tags
      const { data: insertedTags, error: tagErr } = await supabase
        .from('blog_tags')
        .upsert(tagRows, { onConflict: 'slug' })
        .select('id, slug')
      if (tagErr) throw tagErr

      // Map to ids
      const tagIds = insertedTags.map((t: any) => t.id)

      // Clear existing joins then insert new
      await supabase.from('blog_post_tags').delete().eq('post_id', post.id)
      const joinRows = tagIds.map((tid: any) => ({ post_id: post.id, tag_id: tid }))
      if (joinRows.length) await supabase.from('blog_post_tags').insert(joinRows)
    }

    return NextResponse.json({ ok: true, post })
  } catch (err) {
    console.error('Posts POST error:', err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
