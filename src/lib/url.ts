export function getCanonicalBaseUrl(): string | null {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.CANONICAL_URL ||
    null
  )
}

export function getRequestBaseUrl(req: Request): string {
  try {
    // Prefer proxy headers when present
    // @ts-ignore - NextRequest has headers on server
    const h: Headers = req.headers instanceof Headers ? req.headers : new Headers()
    const proto = h.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
    const host = h.get('x-forwarded-host') || h.get('host')
    if (host) return `${proto}://${host}`
  } catch {}
  try {
    const u = new URL((req as any).url)
    return `${u.protocol}//${u.host}`
  } catch {}
  return process.env.NODE_ENV === 'production' ? 'https://tylerweb.dev' : 'http://localhost:3000'
}

export function getBaseUrl(req: Request): string {
  return getCanonicalBaseUrl() || getRequestBaseUrl(req)
}

