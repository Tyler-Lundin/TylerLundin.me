'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { CrmClient } from '@/types/crm';

export async function getClientsAction(): Promise<CrmClient[]> {
  const sb = await createServiceClient();
  const { data, error } = await sb
    .from('crm_clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  return data as CrmClient[];
}
