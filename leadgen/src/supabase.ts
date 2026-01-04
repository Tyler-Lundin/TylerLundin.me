import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';
import type { Lead } from './types.js';

let client: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (!client) {
    if (!config.supabaseUrl || !config.supabaseKey) return null;
    client = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export async function upsertLeads(leads: Lead[]) {
  const supa = getClient();
  if (!supa) return { count: 0 };
  const { data, error } = await supa
    .from('leads')
    .upsert(leads, { onConflict: 'google_place_id', ignoreDuplicates: false })
    .select('id');
  if (error) throw error;
  return { count: data?.length ?? 0 };
}

