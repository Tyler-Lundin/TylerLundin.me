"use server"

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const MARKETING_ROLES = ['marketing_editor', 'marketing_analyst']
const HOMS = ['head_of_marketing', 'head of marketing']

export async function updateMarketingUserRole(userId: string, newRole: string) {
  const me = await getAuthUser()
  if (!me || !(['admin', ...HOMS].includes(String(me.role)))) {
    return { error: 'Forbidden' }
  }
  if (!MARKETING_ROLES.includes(newRole)) {
    return { error: 'Invalid role' }
  }
  const sb: any = await createServiceClient()
  // Only allow editing users who are in marketing roles (not admin/HoM)
  const { data: target } = await sb.from('users').select('id, role').eq('id', userId).maybeSingle()
  if (!target || (target.role && !MARKETING_ROLES.includes(String(target.role)))) {
    return { error: 'Cannot edit this user' }
  }
  const { error } = await sb.from('users').update({ role: newRole }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/marketing/team')
  return { success: true }
}

export async function inviteMarketingUser(formData: FormData) {
  const me = await getAuthUser()
  if (!me || !(['admin', ...HOMS].includes(String(me.role)))) {
    return { error: 'Forbidden' }
  }
  const role = String(formData.get('role') || '')
  const email = String(formData.get('email') || '')
  const inviteMessage = String(formData.get('inviteMessage') || '')
  if (!email || !MARKETING_ROLES.includes(role)) {
    return { error: 'Email and valid marketing role are required' }
  }
  const sb: any = await createServiceClient()
  const key = Math.floor(1000 + Math.random() * 9000).toString()
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const { error } = await sb.from('team_invites').insert({ email, role, message: inviteMessage, invite_key: key, status: 'pending', expires_at: expires.toISOString() })
  if (error) return { error: error.message }
  revalidatePath('/marketing/team')
  return { success: true }
}

