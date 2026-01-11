import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Lazy getter to create an admin Supabase client.
// Reads and validates env vars only when invoked.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

  if (!url || !serviceRole) {
    throw new Error('Supabase admin credentials are not configured')
  }

  return createSupabaseClient<Database>(url, serviceRole, {
    auth: { persistSession: false },
  })
}

