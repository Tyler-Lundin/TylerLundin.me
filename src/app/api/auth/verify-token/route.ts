import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_NAME = 'access_token'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ success: false, code: 'no_token' }, { status: 200 })

    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    const role = (payload as any)?.role
    const userId = (payload as any)?.id || (payload as any)?.sub || (payload as any)?.user_id || (payload as any)?.userId || (payload as any)?.uid || null
    const email = (payload as any)?.email || (payload as any)?.user_email || null
    const isAdmin = role === 'admin'
    return NextResponse.json({ success: true, role, isAdmin, userId, email })
  } catch (e) {
    return NextResponse.json({ success: false, code: 'invalid' }, { status: 200 })
  }
}
