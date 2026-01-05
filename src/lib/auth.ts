import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const COOKIE_NAME = 'access_token'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload { sub?: string; id?: string | number; role?: string; exp?: number; email?: string }

export async function requireAdmin(): Promise<JWTPayload> {
  // Allow admins and head of marketing roles
  return requireRoles(['admin', 'head_of_marketing', 'head of marketing'])
}

export async function requireRoles(roles: string[]): Promise<JWTPayload> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) throw new Error('Unauthorized')
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
  const role = (decoded as any)?.role
  if (!decoded || !roles.includes(String(role))) throw new Error('Forbidden')
  return decoded
}

export async function getUserRole(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return (decoded as any)?.role || null
  } catch {
    return null
  }
}

// Non-throwing helper to get current auth payload (id, role, etc.) or null
export async function getAuthUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    if (!decoded) return null
    const id =
      (decoded as any).id ??
      (decoded as any).sub ??
      (decoded as any).user_id ??
      (decoded as any).userId ??
      (decoded as any).uid
    if (id && !(decoded as any).id) (decoded as any).id = String(id)
    return decoded
  } catch {
    return null
  }
}
