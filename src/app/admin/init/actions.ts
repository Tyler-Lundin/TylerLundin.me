'use server';

import { createServiceClient } from '@/lib/supabase/server';

export async function bootstrapAdminAction(email: string, fullName: string) {
  const sb = await createServiceClient();

  // 1. Safety Check: Only allow if no admins exist
  const { count, error: countErr } = await sb
    .from('users')
    .select('*', { count: 'exact', head: true })
    .in('role', ['admin', 'owner']);

  if (countErr) {
    console.error('Bootstrap check error:', countErr);
    return { success: false, message: 'Database connectivity error' };
  }

  if (count && count > 0) {
    return { success: false, message: 'System is already initialized. Bootstrap is disabled.' };
  }

  // 2. Create Auth User
  // Check if user already exists in auth but not in users table (rare but possible after reset if auth isn't wiped)
  const { data: { users: existingUsers } } = await sb.auth.admin.listUsers();
  const existingUser = existingUsers.find(u => u.email === email);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { data: newUser, error: createError } = await sb.auth.admin.createUser({
      email,
      password: 'AdminTempPassword_' + Math.random().toString(36).slice(2) + '!',
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (createError) {
      console.error('Bootstrap create error:', createError);
      return { success: false, message: 'Auth service error: ' + createError.message };
    }
    userId = newUser.user.id;
  }

  // 3. Set Role to admin in public.users
  // The trigger might have already created the row as guest, so we upsert/update
  const { error: roleErr } = await sb
    .from('users')
    .upsert({ 
      id: userId, 
      email, 
      full_name: fullName, 
      role: 'admin', 
      updated_at: new Date().toISOString() 
    });

  if (roleErr) {
    console.error('Bootstrap role update error:', roleErr);
    return { success: false, message: 'Profile update error' };
  }

  // 4. Generate Magic Link for one-time use
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { data: linkData, error: linkErr } = await sb.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${siteUrl}/dev` // Admins go to /dev
    }
  });

  if (linkErr) {
    console.warn('Could not generate magic link, but admin was created.');
    return { success: true, link: null };
  }

  return { 
    success: true, 
    link: linkData.properties?.action_link || null 
  };
}
