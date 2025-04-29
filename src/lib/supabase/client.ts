'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

  // Only add auth state change listener in browser
  if (typeof window !== 'undefined') {
    supabaseClient.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('[Supabase Auth]', { event, session });
        
        // Handle session changes
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Session is available, you can update your UI here
        } else if (event === 'SIGNED_OUT') {
          // Session is removed, you can update your UI here
        }
      }
    );
  }

  return supabaseClient;
}
