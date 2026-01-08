'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { Advertisement } from '@/types/marketing';
import { revalidatePath } from 'next/cache';

export async function createAdAction(data: Partial<Advertisement>) {
  await requireAdmin();
  const supabase = await createServiceClient();
  
  if (!data.title || !data.cta_link) {
    throw new Error('Title and Link are required');
  }

  const { error } = await supabase.from('advertisements').insert({
    title: data.title,
    description: data.description || null,
    placement: data.placement || 'banner',
    priority: data.priority || 0,
    cta_text: data.cta_text || 'Get Offer',
    cta_link: data.cta_link,
    promo_code: data.promo_code || null,
    is_active: data.is_active ?? true,
    starts_at: data.starts_at || new Date().toISOString(),
    ends_at: data.ends_at || null,
    styles: (data.styles as any) || {}
  });

  if (error) throw new Error(error.message);
  revalidatePath('/dev/marketing/ads');
  revalidatePath('/marketing/ads');
  revalidatePath('/'); // Refresh site shell
}

export async function updateAdAction(id: string, data: Partial<Advertisement>) {
  await requireAdmin();
  const supabase = await createServiceClient();
  
  const { error } = await supabase.from('advertisements').update({
    title: data.title,
    description: data.description,
    placement: data.placement,
    priority: data.priority,
    cta_text: data.cta_text,
    cta_link: data.cta_link,
    promo_code: data.promo_code,
    is_active: data.is_active,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    styles: data.styles
  }).eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/dev/marketing/ads');
  revalidatePath('/marketing/ads');
  revalidatePath('/');
}

export async function deleteAdAction(id: string) {
  await requireAdmin();
  const supabase = await createServiceClient();
  const { error } = await supabase.from('advertisements').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dev/marketing/ads');
  revalidatePath('/marketing/ads');
  revalidatePath('/');
}

export async function getAllAdsAction() {
  await requireAdmin();
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(error.message);
  return data as Advertisement[];
}
