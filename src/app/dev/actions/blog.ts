"use server"

import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { withAuditAction } from '@/lib/audit'

function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function _savePostAction(status: 'draft' | 'published', payloadJson: string) {
  await requireAdmin()
  const supabase: any = await createServiceClient()

  const payload = JSON.parse(payloadJson || '{}') as {
    id?: string
    title?: string
    slug?: string
    excerpt?: string
    content_md?: string
    cover_image_url?: string
    tags?: string[]
    reading_time_minutes?: number
  }

  if (!payload.title || !payload.content_md) {
    throw new Error('Title and content are required')
  }

  const finalSlug = payload.slug ? slugify(payload.slug) : slugify(payload.title)

  const upsertPayload: any = {
    title: payload.title,
    slug: finalSlug,
    excerpt: payload.excerpt,
    content_md: payload.content_md,
    cover_image_url: payload.cover_image_url,
    status,
    reading_time_minutes: payload.reading_time_minutes,
    published_at: status === 'published' ? new Date().toISOString() : null,
  }
  if (payload.id) upsertPayload.id = payload.id

  const { data: post, error } = await supabase
    .from('blog_posts')
    .upsert(upsertPayload)
    .select('*')
    .single()
  if (error) throw error

  const tags = Array.isArray(payload.tags) ? payload.tags : []
  if (tags.length) {
    const tagRows = tags.map((name) => ({ slug: slugify(name), name }))
    const { data: insertedTags, error: tagErr } = await supabase
      .from('blog_tags')
      .upsert(tagRows, { onConflict: 'slug' })
      .select('id, slug')
    if (tagErr) throw tagErr

    const tagIds = insertedTags.map((t: any) => t.id)
    await supabase.from('blog_post_tags').delete().eq('post_id', post.id)
    if (tagIds.length) {
      const joinRows = tagIds.map((tid: any) => ({ post_id: post.id, tag_id: tid }))
      await supabase.from('blog_post_tags').insert(joinRows)
    }
  } else {
    await supabase.from('blog_post_tags').delete().eq('post_id', post.id)
  }

  redirect(`/dev/blog/${post.slug}`)
}

export const savePostAction = withAuditAction('dev.blog.save', _savePostAction)
