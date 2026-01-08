'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(formData: FormData) {
  const sb = await createServiceClient();
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const id = user.id; // Or formData.get('id') if we want to allow admins to edit others?
  // Ideally we verify permissions. For now assume user edits own profile.
  // If admin, we might need to pass target ID.
  const targetId = String(formData.get('id') || id);
  
  // Verify ownership or admin
  if (targetId !== id && user.role !== 'admin' && user.role !== 'owner') {
      throw new Error('Unauthorized');
  }

  const full_name = String(formData.get('full_name') || '');
  const headline = String(formData.get('headline') || '');
  const avatar_url = String(formData.get('avatar_url') || formData.get('avatar_url_hidden') || '');
  const bio = String(formData.get('bio') || '');
  const visibility = String(formData.get('visibility') || 'public') as 'public' | 'private';
  
  const twitter = String(formData.get('social_twitter') || '');
  const github = String(formData.get('social_github') || '');
  const linkedin = String(formData.get('social_linkedin') || '');
  const website = String(formData.get('social_website') || '');
  
  const socialsJsonRaw = String(formData.get('socials_json') || '');
  let baseFromJson: any = {};
  if (socialsJsonRaw.trim()) {
    try {
      const parsed = JSON.parse(socialsJsonRaw);
      if (parsed && typeof parsed === 'object') baseFromJson = parsed;
    } catch {}
  }
  
  const socials: any = {
    ...baseFromJson,
    ...(twitter.trim() && { twitter: twitter.trim() }),
    ...(github.trim() && { github: github.trim() }),
    ...(linkedin.trim() && { linkedin: linkedin.trim() }),
    ...(website.trim() && { website: website.trim() })
  };

  let emailToUse = user.email;

  if (targetId !== user.id) {
      // Admin editing someone else
      // Try to get email from existing public user
      const { data: existingPublic } = await sb.from('users').select('email').eq('id', targetId).maybeSingle();
      if (existingPublic) {
          emailToUse = existingPublic.email;
      } else {
          // Try to get from Auth
          const { data: authUser } = await sb.auth.admin.getUserById(targetId);
          if (authUser?.user?.email) {
              emailToUse = authUser.user.email;
          } else {
              throw new Error('Target user not found');
          }
      }
  }

  const { error: userError } = await sb.from('users').upsert({ 
      id: targetId, 
      email: emailToUse,
      full_name, 
      updated_at: new Date().toISOString() 
  }, { onConflict: 'id' });
  
  if (userError) throw new Error(userError.message);

  const { error: profileError } = await sb.from('user_profiles').upsert({ 
    user_id: targetId, 
    headline, 
    avatar_url, 
    bio, 
    visibility, 
    socials: Object.keys(socials).length ? socials : null, 
    updated_at: new Date().toISOString() 
  }, { onConflict: 'user_id' });

  if (profileError) throw new Error(profileError.message);

  revalidatePath(`/profile/${targetId}`);
  return { success: true };
}
