'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/portal';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const handleAuth = async () => {
      // 1. Check for PKCE Code
      const code = searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace(next);
          return;
        } else {
            console.error('PKCE Error:', error);
        }
      }

      // 2. Manual Hash Parsing (Implicit Flow Fallback)
      // Robustly handle cases where the client doesn't pick up the hash immediately
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
             const { error: setSessionError } = await supabase.auth.setSession({
                 access_token: accessToken,
                 refresh_token: refreshToken || ''
             });
             if (!setSessionError) {
                 router.replace(next);
                 return;
             }
        }
      }

      // 3. Check for Existing Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.replace(next);
        return;
      }

      // 3. Listen for deferred auth state change (Implicit flow often fires SIGNED_IN shortly after load)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.replace(next);
        }
      });

      // 4. Handle Errors / Timeout
      const errorDesc = searchParams.get('error_description');
      if (errorDesc) {
          setError(decodeURIComponent(errorDesc));
      } else {
          // If no session after 3s, assume failure if no hash present
          setTimeout(() => {
              if (!window.location.hash.includes('access_token') && !code) {
                  // Only show error if we really don't have tokens
                  // setError('Authentication timed out or failed.');
                  // Redirect to login to retry
                  router.replace('/login?error=timeout');
              }
          }, 3000);
      }

      return () => subscription.unsubscribe();
    };

    handleAuth();
  }, [router, next, searchParams]);

  if (error) {
      return (
          <div className="flex h-screen items-center justify-center bg-white dark:bg-black text-center p-4">
              <div>
                <p className="text-red-500 font-bold mb-2">Authentication Failed</p>
                <p className="text-sm text-neutral-500 mb-4">{error}</p>
                <a href="/login" className="text-blue-600 hover:underline">Return to Login</a>
              </div>
          </div>
      )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-400" />
        <p className="mt-2 text-sm text-neutral-500">Verifying session...</p>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
    return (
        <Suspense fallback={null}>
            <ConfirmContent />
        </Suspense>
    )
}
