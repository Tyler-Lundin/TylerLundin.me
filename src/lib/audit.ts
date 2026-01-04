import { createServiceClient } from '@/lib/supabase/server'

export type AuditPayload = {
  route?: string
  action?: string
  method?: string
  status?: number
  actorId?: string | null
  actorEmail?: string | null
  actorRole?: string | null
  ip?: string | null
  userAgent?: string | null
  payload?: any
  result?: any
  error?: string | null
}

export async function auditLog(entry: AuditPayload) {
  try {
    const sb: any = await createServiceClient()
    const row: any = {
      route: entry.route || null,
      action: entry.action || null,
      method: entry.method || null,
      status: typeof entry.status === 'number' ? entry.status : null,
      actor_id: entry.actorId || null,
      actor_email: entry.actorEmail || null,
      actor_role: entry.actorRole || null,
      ip: entry.ip || null,
      user_agent: entry.userAgent || null,
      payload: entry.payload ? toJson(entry.payload) : null,
      result: entry.result ? toJson(entry.result) : null,
      error: entry.error || null,
    }
    await sb.from('audit_logs').insert(row as any)
  } catch (e) {
    // Last-resort logging; do not throw
    console.error('[auditLog] failed to write audit log', e)
  }
}

function toJson(v: any) {
  try {
    return JSON.parse(JSON.stringify(v))
  } catch {
    return null
  }
}

export function withAuditAction<T extends (...args: any[]) => Promise<any> | any>(action: string, fn: T): T {
  // Returns a server-action-compatible wrapper that logs args/results
  const wrapped = (async (...args: any[]) => {
    let result: any
    let error: any
    // Try to capture IP and UA in server action context
    let ip: string | null = null
    let userAgent: string | null = null
    try {
      const { headers } = await import('next/headers')
      const h: any = await (headers() as unknown as Promise<Headers>)
      const xff = (h.get('x-forwarded-for') || '').split(',')[0]?.trim()
      ip = xff || h.get('x-real-ip') || h.get('cf-connecting-ip') || h.get('x-client-ip') || null
      userAgent = h.get('user-agent') || null
    } catch {}

    try {
      result = await fn(...args)
      return result
    } catch (e: any) {
      error = e
      throw e
    } finally {
      try {
        await auditLog({
          route: 'server_action',
          action,
          method: 'SERVER_ACTION',
          status: error ? 500 : 200,
          ip,
          userAgent,
          payload: safeArgs(args),
          result: safeResult(result),
          error: error ? String(error?.message || error) : null,
        })
      } catch (e2) {
        console.error('[withAuditAction] failed to audit', e2)
      }
    }
  }) as T
  return wrapped
}

function safeArgs(args: any[]) {
  try {
    // Avoid logging full FormData; serialize keys only
    const mapped = args.map((a) => {
      if (typeof FormData !== 'undefined' && a instanceof FormData) {
        try {
          const obj: any = {}
          ;(a as any).forEach((val: any, key: string) => { obj[key] = typeof val === 'string' ? val.slice(0, 200) : '[binary]' })
          return { __type: 'FormData', fields: obj }
        } catch { return { __type: 'FormData' } }
      }
      return a
    })
    return toJson(mapped)
  } catch { return null }
}

function safeResult(res: any) {
  try { return toJson(res) } catch { return null }
}

export function withAuditRoute(action: string, handler: (req: Request, ctx?: any) => Promise<Response>) {
  return async (req: Request, ctx?: any) => {
    let status = 200
    let error: any
    let bodyJson: any = null
    let res: Response
    let resultBody: any = null
    try {
      // Best-effort clone without consuming body when not JSON
      try {
        if ((req.headers.get('content-type') || '').includes('application/json')) {
          bodyJson = await req.clone().json().catch(() => null)
        }
      } catch {}
      res = await handler(req, ctx)
      status = (res as any)?.status || 200
      try { resultBody = await res.clone().json().catch(() => null) } catch {}
      return res
    } catch (e: any) {
      error = e
      status = 500
      throw e
    } finally {
      try {
        const headersObj = Object.fromEntries(req.headers.entries()) as any
        const ip = (headersObj['x-forwarded-for'] || headersObj['x-real-ip'] || '').split(',')[0]?.trim() || null
        const ua = headersObj['user-agent'] || null
        await auditLog({
          route: (req as any)?.url || 'route_handler',
          action,
          method: req.method,
          status,
          ip,
          userAgent: ua,
          payload: bodyJson,
          result: resultBody,
          error: error ? String(error?.message || error) : null,
        })
      } catch (e2) {
        console.error('[withAuditRoute] failed to audit', e2)
      }
    }
  }
}
