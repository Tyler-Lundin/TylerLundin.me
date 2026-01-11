'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { Advertisement } from '@/types/marketing';

export async function getActiveAdsAction(placement?: string): Promise<Advertisement[]> {
  try {
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    let query = supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false });

    if (placement) {
      query = query.eq('placement', placement);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ads:', error);
      return [];
    }

    return (data || []) as Advertisement[];
  } catch (e) {
    console.error('Auth crash in getActiveAdsAction:', e);
    return [];
  }
}
