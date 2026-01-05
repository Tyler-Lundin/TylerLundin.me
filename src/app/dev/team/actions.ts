'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, newRole: string) {
  const sb: any = await createServiceClient()
  
  // Update public.users
  const { error } = await sb.from('users').update({ role: newRole }).eq('id', userId)
  
  if (error) {
    console.error('Error updating user role:', error)
    return { error: error.message }
  }

  // Also update crm_profiles if it exists and has a role column, just in case
  // The fetchTeamStats used crm_profiles, so it's likely important.
  // We ignore error here as crm_profiles might be a view or linked differently
  await sb.from('crm_profiles').update({ role: newRole }).eq('id', userId)

  revalidatePath('/dev/team')
  return { success: true }
}

export async function inviteUser(prevState: any, formData: FormData) {
  try {
    const { createServiceClient } = await import('@/lib/supabase/server')
    const { sendInviteEmail } = await import('@/lib/email')
    const sb: any = await createServiceClient()
    
    const role = String(formData.get('role') || 'member')
    const email = String(formData.get('email') || '')
    const inviteMessage = String(formData.get('inviteMessage') || '')
    
    if (!email) return { error: 'Email is required' }
    
    const key = Math.floor(1000 + Math.random() * 9000).toString()
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    
    const { error } = await sb.from('team_invites').insert({ 
      email, 
      role, 
      message: inviteMessage, 
      invite_key: key, 
      status: 'pending', 
      expires_at: expires.toISOString() 
    })

    if (error) {
      return { error: error.message }
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined) ||
      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000') ||
      ''
    const joinUrl = `${baseUrl}/join?email=${encodeURIComponent(email)}&key=${encodeURIComponent(key)}`
    
    await sendInviteEmail({ to: email, message: inviteMessage, link: joinUrl })
    
    revalidatePath('/dev/team')
    return { success: true }
  } catch (e: any) {
    return { error: e.message || 'Failed to send invite' }
  }
}

export async function deleteUser(userId: string) {
  const sb: any = await createServiceClient()

  // Look up user to capture email for invite cleanup
  const { data: user, error: userErr } = await sb
    .from('users')
    .select('id, email')
    .eq('id', userId)
    .maybeSingle()

  if (userErr) {
    console.error('deleteUser: fetch user error', userErr)
    return { error: userErr.message }
  }
  if (!user) return { error: 'User not found' }

  // Best-effort cleanup of related rows not covered by FKs
  const email = user.email
  try {
    // Remove any team credentials
    await sb.from('team_credentials').delete().eq('user_id', userId)
  } catch (e) {
    console.warn('deleteUser: credentials cleanup warning', e)
  }
  try {
    // Remove any invites tied to the same email
    if (email) await sb.from('team_invites').delete().eq('email', email)
  } catch (e) {
    console.warn('deleteUser: invites cleanup warning', e)
  }

  // Delete the user; FKs with ON DELETE CASCADE/SET NULL will handle the rest
  const { error: delErr } = await sb.from('users').delete().eq('id', userId)
  if (delErr) {
    console.error('deleteUser: users delete error', delErr)
    return { error: delErr.message }
  }

  revalidatePath('/dev/team')
  return { success: true }
}
