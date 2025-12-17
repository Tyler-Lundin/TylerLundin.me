import { NextResponse } from 'next/server';

function createCsrfToken() {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export async function GET() {
  const token = createCsrfToken();
  const res = NextResponse.json({ token });
  res.cookies.set('csrf_token', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  return res;
}

