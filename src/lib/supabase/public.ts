import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Lazy getter for a public (anon) Supabase client.
export function getSupabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error('Supabase public credentials are not configured')
  }

  return createSupabaseClient<Database>(url, anon)
}

