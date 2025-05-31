import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// JWT secret - should be in env vars in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_NAME = 'auth_token'

export async function POST(request: Request) {
  try {
    const { passwords } = await request.json()
    console.log('Received passwords:', passwords)
    if (!Array.isArray(passwords) || passwords.length !== 3) {
      console.log('Invalid password format')
      return NextResponse.json(
        { 
          success: false,
          code: 'invalid_format',
          message: 'Invalid request format' 
        },
        { status: 400 }
      )
    }

    const supabase = await createServiceClient()
    console.log('Supabase service client created')

    // First, try a direct SQL query to verify data access
    const { data: rawData, error: rawError } = await supabase
      .from('admin_passwords')
      .select('*')
      .limit(1)

    console.log('Direct query result:', { rawData, rawError })

    if (rawError) {
      console.error('Direct query error:', rawError)
      return NextResponse.json(
        { 
          success: false,
          code: 'database_error',
          message: 'Database error',
          error: rawError.message 
        },
        { status: 500 }
      )
    }

    // Then try the specific query
    const { data, error } = await supabase
      .from('admin_passwords')
      .select('password_1_hash, password_2_hash, password_3_hash')
      .eq('id', 1)
      .maybeSingle()

    console.log('Database query result:', { data, error })
    console.log('Query details:', {
      table: 'admin_passwords',
      id: 1,
      columns: ['password_1_hash', 'password_2_hash', 'password_3_hash']
    })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { 
          success: false,
          code: 'database_error',
          message: 'Authentication failed',
          error: error.message 
        },
        { status: 401 }
      )
    }

    if (!data) {
      console.error('No data returned from database')
      return NextResponse.json(
        { 
          success: false,
          code: 'no_data',
          message: 'No admin passwords found' 
        },
        { status: 401 }
      )
    }

    // Verify all three passwords
    const valid1 = await bcrypt.compare(passwords[0], data.password_1_hash)
    const valid2 = await bcrypt.compare(passwords[1], data.password_2_hash)
    const valid3 = await bcrypt.compare(passwords[2], data.password_3_hash)

    console.log('Password validation results:', { valid1, valid2, valid3 })

    if (!valid1 || !valid2 || !valid3) {
      console.log('Password validation failed:', { valid1, valid2, valid3 })
      return NextResponse.json(
        { 
          success: false,
          code: 'invalid_credentials',
          message: 'Invalid credentials' 
        },
        { status: 401 }
      )
    }

    console.log('All passwords valid, creating JWT token')

    // Create JWT token
    const token = jwt.sign(
      { 
        id: 1,
        role: 'admin',
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    )

    console.log('JWT token created')

    // Create response with success message
    const response = NextResponse.json({ 
      success: true,
      code: 'success',
      message: 'Authentication successful'
    })

    // Set HTTP-only cookie with the JWT
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    })

    console.log('Cookie set, returning response')
    return response
  } catch (error) {
    console.error('Auth error:', error)
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