import { NextResponse } from 'next/server'

const COOKIE_NAME = 'auth_token'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set({ name: COOKIE_NAME, value: '', httpOnly: true, maxAge: 0, path: '/', sameSite: 'strict' })
  return res
}

