import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const COOKIE_NAME = 'auth_token'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  id: number
  role: string
  timestamp: number
  [key: string]: unknown
}

export async function requireAdmin(): Promise<JWTPayload> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) throw new Error('Unauthorized')
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
  if (!decoded || decoded.role !== 'admin') throw new Error('Forbidden')
  return decoded
}

