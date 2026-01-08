import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    // Fetch role
    const { data: roleData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
      
    return {
      id: user.id,
      email: user.email!,
      role: roleData?.role || 'viewer'
    };
  } catch (e) {
    console.error('[Auth] getAuthUser error:', e);
    return null;
  }
}

export async function requireRoles(roles: string[]): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  
  if (!roles.includes(user.role)) {
    console.warn(`[Auth] User ${user.id} (${user.role}) denied access. Required: ${roles.join(', ')}`);
    // Redirect to portal if they are a viewer/client, otherwise login
    redirect('/portal');
  }
  
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRoles(['admin', 'owner', 'head_of_marketing']);
}

export async function getUserRole(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.role || null;
}