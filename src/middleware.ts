import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_NAME = 'auth_token'

// Add paths that should be protected
const PROTECTED_PATHS = [
  '/dev',
  '/api/admin'
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log('🔵 Middleware: Checking path:', { path })

  // Check if the path should be protected
  const isProtectedPath = PROTECTED_PATHS.some(protectedPath => 
    path.startsWith(protectedPath)
  )
  console.log('🔵 Path protection check:', { isProtectedPath })

  if (!isProtectedPath) {
    console.log('🔵 Path not protected, allowing request')
    return NextResponse.next()
  }

  console.log('🔵 Protected path detected, checking auth...')

  // Get the token from request cookies
  const token = request.cookies.get(COOKIE_NAME)?.value
  console.log('🔵 Cookie check:', { hasToken: !!token })

  if (!token) {
    console.log('🔴 No token found, redirecting to login')
    // Redirect to login page if no token
    const url = new URL('/login', request.url)
    // Add the original URL as a redirect parameter
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  try {
    console.log('🔵 Verifying JWT token...')
    // Create a TextEncoder for the secret
    const encoder = new TextEncoder()
    const secret = encoder.encode(JWT_SECRET)
    
    // Verify the token using jose
    const { payload } = await jose.jwtVerify(token, secret)
    console.log('✅ Token verified successfully:', {
      payload: {
        ...payload,
        // Don't log sensitive data
        iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : undefined,
        exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : undefined
      }
    })
    
    // Token is valid, allow the request
    return NextResponse.next()
  } catch (error) {
    console.error('🔴 Token verification failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown'
    })
    // Token is invalid or expired
    const response = NextResponse.redirect(new URL('/login', request.url))
    // Clear the invalid cookie
    console.log('🔴 Deleting invalid cookie')
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dev/:path*',
    '/api/admin/:path*'
  ]
} 