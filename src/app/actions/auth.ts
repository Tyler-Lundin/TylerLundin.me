'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { sendClientWelcomeEmail } from '@/lib/email'; // Reuse or make a generic one

export async function sendLoginLinkAction(email: string, redirectTo?: string) {
  const supabase = await createServiceClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Determine default redirect based on role if not provided
  let nextPath = redirectTo;
  
  const { data: profile } = await supabase.from('users').select('full_name, role').eq('email', email).single();
  
  if (!nextPath) {
    const role = profile?.role || 'guest';
    if (role === 'admin' || role === 'owner') {
      nextPath = '/dev';
    } else if (role === 'head_of_marketing' || role === 'head of marketing') {
      nextPath = '/marketing';
    } else {
      nextPath = '/portal';
    }
  }

  const { data: linkData, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${siteUrl}/auth/confirm?next=${encodeURIComponent(nextPath)}`
    }
  });

  if (error) {
    console.error('Login Link Error:', error);
    return { success: false, message: 'Could not generate login link. Are you registered?' };
  }

  if (linkData?.properties?.action_link) {
    const name = profile?.full_name || 'User';

    // Reuse the welcome email or create a specific Login email function
    // For now reuse welcome as it's generic enough "Access Dashboard"
    await sendClientWelcomeEmail({
      to: email,
      name,
      link: linkData.properties.action_link
    });
    
    return { success: true };
  }

  return { success: false, message: 'Failed to generate link' };
}
