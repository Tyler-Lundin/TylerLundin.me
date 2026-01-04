"use server"

import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { withAuditAction } from '@/lib/audit'

async function _approveCommentAction(id: string) {
  await requireAdmin()
  const sb: any = await createServiceClient()
  const { error } = await sb.from('blog_comments').update({ status: 'approved' }).eq('id', id)
  if (error) throw error
}

async function _deleteCommentAction(id: string) {
  await requireAdmin()
  const sb: any = await createServiceClient()
  const { error } = await sb.from('blog_comments').delete().eq('id', id)
  if (error) throw error
}

export const approveCommentAction = withAuditAction('dev.comments.approve', _approveCommentAction)
export const deleteCommentAction = withAuditAction('dev.comments.delete', _deleteCommentAction)
