"use server"

import { redirect } from 'next/navigation'
import { getAuthUser } from './auth'
import { createServiceClient } from './supabase/server'

// If a user is logged in but has no user_profiles row, redirect to /profile/{id}
export async function ensureProfileOrRedirect() {
  const me = await getAuthUser()
  let userId: string | null = ((me as any)?.id || (me as any)?.sub || null) as any
  const sb: any = await createServiceClient()
  if (!userId && (me as any)?.email) {
    const { data: u } = await sb.from('users').select('id').ilike('email', String((me as any).email)).maybeSingle()
    if (u?.id) userId = String(u.id)
  }
  if (!userId) return
  const { data: prof } = await sb
    .from('user_profiles')
    .select('user_id')
    .eq('user_id', String(userId))
    .maybeSingle()
  
  if (!prof) {
    // Auto-create missing profile row to avoid redirect loop
    await sb.from('user_profiles').insert({ user_id: String(userId) });
  }
}
