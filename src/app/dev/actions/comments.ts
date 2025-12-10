"use server"

import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function approveCommentAction(id: string) {
  await requireAdmin()
  const sb: any = await createServiceClient()
  const { error } = await sb.from('blog_comments').update({ status: 'approved' }).eq('id', id)
  if (error) throw error
}

export async function deleteCommentAction(id: string) {
  await requireAdmin()
  const sb: any = await createServiceClient()
  const { error } = await sb.from('blog_comments').delete().eq('id', id)
  if (error) throw error
}
