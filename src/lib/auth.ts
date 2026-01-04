import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const COOKIE_NAME = 'access_token'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload { sub?: string; id?: string | number; role?: string; exp?: number; email?: string }

export async function requireAdmin(): Promise<JWTPayload> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) throw new Error('Unauthorized')
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
  if (!decoded || (decoded as any).role !== 'admin') throw new Error('Forbidden')
  return decoded
}
