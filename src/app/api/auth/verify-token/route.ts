import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_NAME = 'auth_token'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ success: false, code: 'no_token' }, { status: 200 })

    const secret = new TextEncoder().encode(JWT_SECRET)
    await jose.jwtVerify(token, secret)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, code: 'invalid' }, { status: 200 })
  }
}

