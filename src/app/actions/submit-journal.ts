'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { headers } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_NAME = 'auth_token'

interface JWTPayload {
  id: number
  role: string
  timestamp: number
  [key: string]: unknown
}

export async function submitJournal(text: string) {
  console.log('🔵 Starting journal submission...')
  const supabase = await createClient()
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  console.log('🔵 Auth token found:', { hasToken: !!token })

  if (!token) {
    console.log('🔴 No auth token found in cookies')
    throw new Error('Not authenticated')
  }

  try {
    // Verify JWT token
    console.log('🔵 Attempting to verify JWT token...')
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    console.log('🔵 Decoded JWT payload:', {
      ...decoded,
      // Don't log sensitive data
      iat: decoded.iat ? new Date((decoded.iat as number) * 1000).toISOString() : undefined,
      exp: decoded.exp ? new Date((decoded.exp as number) * 1000).toISOString() : undefined
    })

    if (!decoded) {
      console.log('🔴 Token verification failed - no decoded payload')
      throw new Error('Invalid token')
    }

    if (!decoded.id) {
      console.log('🔴 Token verification failed - no id in payload:', decoded)
      throw new Error('Invalid token - missing id')
    }

    console.log('✅ Token verified successfully, proceeding with summary...')

    // Get the host from headers
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    console.log('🔵 Making summary request to:', `${baseUrl}/api/summarize-journal`)

    // Summarize via internal call or OpenAI, whatever your backend uses
    const summaryRes = await fetch(`${baseUrl}/api/summarize-journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!summaryRes.ok) {
      console.log('🔴 Failed to get summary:', { status: summaryRes.status })
      throw new Error('Failed to summarize journal entry')
    }

    const { summary } = await summaryRes.json()
    console.log('✅ Summary generated successfully')

    console.log('🔵 Inserting journal entry...')
    const { error: dbError } = await supabase.from('journal_entries').insert({
      entry_text: text,
      status_text: summary,
      published: false,
      created_at: new Date().toISOString()
    })

    if (dbError) {
      console.log('🔴 Database error:', dbError)
      throw new Error(dbError.message)
    }

    console.log('✅ Journal entry created successfully')
  } catch (error) {
    console.error('🔴 Error in submitJournal:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    })

    if (error instanceof jwt.JsonWebTokenError) {
      console.log('🔴 JWT verification error:', {
        name: error.name,
        message: error.message
      })
      throw new Error('Invalid or expired token')
    }
    throw error
  }
} 