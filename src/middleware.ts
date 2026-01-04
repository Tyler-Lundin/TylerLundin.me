import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_NAME = 'access_token'

// Add paths that should be protected
const PROTECTED_PATHS = [
  '/dev',
  '/api/admin',
  '/api/dev'
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path should be protected
  const isProtectedPath = PROTECTED_PATHS.some(protectedPath => path.startsWith(protectedPath))

  // If visiting /login and already admin, redirect to /dev
  if (path === '/login') {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (token) {
      try {
        const encoder = new TextEncoder()
        const secret = encoder.encode(JWT_SECRET)
        const { payload } = await jose.jwtVerify(token, secret)
        if ((payload as any)?.role === 'admin') {
          const url = new URL('/dev', request.url)
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
    if ((payload as any)?.role !== 'admin') {
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
    '/api/admin/:path*',
    '/api/dev/:path*'
  ]
}
