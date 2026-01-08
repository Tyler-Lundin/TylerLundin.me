'use server';

import { createClient } from '@/lib/supabase/server';
import { Advertisement } from '@/types/marketing';

export async function getActiveAdsAction(placement?: string): Promise<Advertisement[]> {
  try {
    const supabase = await createClient();
    
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
