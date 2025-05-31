import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt, { JwtPayload } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_NAME = 'auth_token'

export async function GET() {
  console.log('🔵 Verify Token API: Request received')
  
  try {
    console.log('🔵 Getting cookie store...')
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    console.log('🔵 Cookie found:', { hasToken: !!token })

    if (!token) {
      console.log('🔴 No token found in cookies')
      return NextResponse.json(
        { 
          success: false,
          code: 'no_token',
          message: 'No authentication token found' 
        },
        { status: 401 }
      )
    }

    try {
      console.log('🔵 Verifying JWT token...')
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
      console.log('✅ Token verified successfully:', { 
        decoded: {
          ...decoded,
          // Don't log sensitive data
          iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : undefined,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined
        }
      })
      
      return NextResponse.json({ 
        success: true,
        code: 'valid_token',
        message: 'Token is valid',
        user: decoded
      })
    } catch (error) {
      console.error('🔴 Token verification failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      })
      return NextResponse.json(
        { 
          success: false,
          code: 'invalid_token',
          message: 'Invalid or expired token' 
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('🔴 Error in verify-token route:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        success: false,
        code: 'server_error',
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
} 