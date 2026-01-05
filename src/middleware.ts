import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_NAME = 'access_token'

// Add paths that should be protected
const PROTECTED_PATHS = ['/dev', '/marketing', '/api/admin', '/api/dev']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path should be protected
  const isProtectedPath = PROTECTED_PATHS.some(protectedPath => path.startsWith(protectedPath))

  // If visiting /login and already authenticated, redirect to role home
  if (path === '/login') {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (token) {
      try {
        const encoder = new TextEncoder()
        const secret = encoder.encode(JWT_SECRET)
        const { payload } = await jose.jwtVerify(token, secret)
        const role = (payload as any)?.role
        if (role === 'admin') {
          const url = new URL('/dev', request.url)
          return NextResponse.redirect(url)
        }
        if (role === 'head_of_marketing' || role === 'head of marketing') {
          const url = new URL('/marketing', request.url)
          return NextResponse.redirect(url)
        }
      } catch {}
    }
    return NextResponse.next()
  }

  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // Protected paths require admin token (short-lived access token)
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  try {
    const encoder = new TextEncoder()
    const secret = encoder.encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    const role = (payload as any)?.role
    // /dev requires admin; /marketing allows admin or head_of_marketing
    if (path.startsWith('/dev')) {
      if (role !== 'admin') {
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
      }
    } else if (path.startsWith('/marketing')) {
      if (role !== 'admin' && role !== 'head_of_marketing' && role !== 'head of marketing') {
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
      }
    } else if (!path.startsWith('/api')) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  } catch (error) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', path)
    const response = NextResponse.redirect(url)
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/login',
    '/dev/:path*',
    '/marketing/:path*',
    '/api/admin/:path*',
    '/api/dev/:path*'
  ]
}
