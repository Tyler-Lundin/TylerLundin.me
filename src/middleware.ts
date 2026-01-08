import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  let user = null;
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error) throw error;
    user = authUser;
  } catch (e: any) {
    // If any auth error occurs, we need to clear the session and redirect
    // to prevent downstream components from trying to use a broken token.
    const hasAuthCookies = request.cookies.getAll().some(c => c.name.startsWith('sb-') || c.name.includes('auth-token'));
    
    if (hasAuthCookies) {
      console.warn('[Middleware] Nuclear auth cleanup triggered:', e.message);
      
      // Create a redirect response to the same URL to "refresh" the state
      const redirectResponse = NextResponse.redirect(request.nextUrl.href);
      
      // Clear ALL possible auth cookies
      request.cookies.getAll().forEach(cookie => {
        if (cookie.name.startsWith('sb-') || cookie.name.includes('auth-token') || cookie.name === 'access_token' || cookie.name === 'refresh_token') {
          redirectResponse.cookies.delete(cookie.name);
        }
      });
      
      return redirectResponse;
    }
  }

  const path = request.nextUrl.pathname

  // 1. Handle Protected Paths (/dev, /marketing)
  const isAdminPath = path.startsWith('/dev')
  const isMarketingPath = path.startsWith('/marketing')

  if (isAdminPath || isMarketingPath) {
    if (!user) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }

    // Fetch role from public.users
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'guest'

    if (isAdminPath && !(role === 'admin' || role === 'owner')) {
      return NextResponse.redirect(new URL('/portal', request.url))
    }

    if (isMarketingPath && !(role === 'admin' || role === 'owner' || role === 'head_of_marketing')) {
      return NextResponse.redirect(new URL('/portal', request.url))
    }
  }

  // 2. Redirect logged-in users away from /login
  if (path === '/login' && user) {
    // We don't fetch role again here for speed, just go to portal 
    // and let portal or middleware redirect again if needed.
    // Or better, fetch it once.
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const role = profile?.role || 'guest'
    if (role === 'admin' || role === 'owner') {
      return NextResponse.redirect(new URL('/dev', request.url))
    }
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/login',
    '/dev/:path*',
    '/marketing/:path*',
    '/api/admin/:path*',
    '/api/dev/:path*'
  ]
}