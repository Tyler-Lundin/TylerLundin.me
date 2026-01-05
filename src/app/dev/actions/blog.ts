"use server"

import { getAuthUser } from '@/lib/auth'
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
  const me = await getAuthUser()
  if (!me) throw new Error('Unauthorized')
  const supabase: any = await createServiceClient()

  const payload = JSON.parse(payloadJson || '{}') as {
    base?: 'dev' | 'marketing'
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
  if (me?.id && !upsertPayload.author_id) upsertPayload.author_id = String(me.id)

  // If no id provided, try to update by slug to avoid duplicates
  if (!upsertPayload.id) {
    const { data: existingBySlug } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle()
    if (existingBySlug?.id) upsertPayload.id = existingBySlug.id
  }

  // Permissions: marketing and above can draft; only HoM/Admin can publish
  const role = String((me as any).role || '')
  const canDraft = ['admin', 'head_of_marketing', 'head of marketing', 'marketing_editor', 'marketing_analyst'].includes(role)
  const canPublish = ['admin', 'head_of_marketing', 'head of marketing'].includes(role)
  if (!canDraft) throw new Error('Forbidden')
  if (status === 'published' && !canPublish) throw new Error('Only Head of Marketing or Admin can publish')

  // If editing an existing post, enforce ownership unless privileged
  let existing: any = null
  if (upsertPayload.id) {
    const { data } = await supabase.from('blog_posts').select('id, author_id').eq('id', upsertPayload.id).maybeSingle()
    existing = data
  } else {
    const { data } = await supabase.from('blog_posts').select('id, author_id').eq('slug', finalSlug).maybeSingle()
    existing = data
    if (existing?.id) upsertPayload.id = existing.id
  }
  if (existing && existing.author_id && String(existing.author_id) !== String(me.id) && !canPublish) {
    throw new Error('You can only edit your own post')
  }

  const { data: post, error } = await supabase
    .from('blog_posts')
    .upsert(upsertPayload, { onConflict: upsertPayload.id ? 'id' : 'slug' })
    .select('*')
    .single()
  if (error) throw error

  // If publishing, ensure author has a profile; if not, redirect to profile setup
  if (status === 'published') {
    const authorId = upsertPayload.author_id || post.author_id
    if (authorId) {
      const { data: prof } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', authorId)
        .maybeSingle()
      if (!prof) return redirect(`/profile/${authorId}`)
    }
  }

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

  // Redirect rules
  if (status === 'published') {
    redirect(`/blog/${post.slug}`)
  } else {
    const base = payload.base === 'marketing' ? 'marketing' : 'dev'
    redirect(`/${base}/blog/${post.slug}`)
  }
}

export const savePostAction = withAuditAction('dev.blog.save', _savePostAction)
