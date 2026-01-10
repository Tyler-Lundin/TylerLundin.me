import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type Role = 'admin' | 'owner' | 'head_of_marketing' | 'member' | 'client' | 'guest' | string | null;

export function useUser() {
  const [user, setUser] = useState<{ id: string; email: string; fullName?: string } | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    async function getUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('role, full_name')
            .eq('id', authUser.id)
            .single();

          setUser({
            id: authUser.id,
            email: authUser.email!,
            fullName: profile?.full_name || undefined
          });
          setRole(profile?.role || 'guest');
        } else {
            setUser(null);
            setRole(null);
        }
      } catch {
        // console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        getUser();
    });
    return () => subscription.unsubscribe();

  }, []);

  return { user, role, loading };
}
