import { createServiceClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

export type HealthItem = {
  id: string
  label: string
  status: 'ok' | 'warn' | 'error' | 'pending'
  detail?: string
  link?: string
  ts?: string
}

export async function runHealthForProject(projectId: string, client?: SupabaseClient<Database>): Promise<HealthItem[]> {
  const sb = client || (await createServiceClient())

  const { data: project, error } = await sb
    .from('crm_projects')
    .select('id, project_health_url, project_health_secret, project_health_enabled')
    .eq('id', projectId)
    .single()
  if (error || !project) {
    return [
      { id: 'project', label: 'Project', status: 'error', detail: 'Project not found' },
    ]
  }

  if (!project.project_health_enabled) {
    return [
      { id: 'health', label: 'Health disabled', status: 'warn', detail: 'Enable in project settings', ts: new Date().toISOString() },
    ]
  }

  const url = project.project_health_url
  if (!url) {
    return [
      { id: 'health', label: 'Missing health URL', status: 'error', detail: 'Set project_health_url', ts: new Date().toISOString() },
    ]
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'tl-dev-health/1.0',
  }
  const shared = project.project_health_secret || process.env.DEV_HEALTH_KEY || ''
  if (shared) headers['X-Health-Key'] = shared

  let items: HealthItem[] | null = null
  let errText: string | null = null
  const startedAt = Date.now()
  try {
    const res = await fetch(url, { method: 'GET', headers, signal: controller.signal, cache: 'no-store' as RequestCache })
    if (!res.ok) {
      errText = `Health endpoint error (${res.status})`
    } else {
      const json = await res.json()
      items = normalize(json)
    }
  } catch (e: any) {
    errText = e?.name === 'AbortError' ? 'Health request timed out' : (e?.message || 'Failed to fetch health')
  } finally {
    clearTimeout(timeout)
  }

  const outItems: HealthItem[] = items || [
    { id: 'http', label: 'Health fetch', status: 'error', detail: errText || 'Unknown error', ts: new Date().toISOString() },
  ]

  const finishedAt = Date.now()
  const durationMs = Math.max(0, finishedAt - startedAt)
  const overall = worstStatus(outItems)
  try {
    await sb.from('crm_project_health_runs').insert({
      project_id: projectId,
      started_at: new Date(startedAt).toISOString(),
      finished_at: new Date(finishedAt).toISOString(),
      duration_ms: durationMs,
      overall_status: overall as any,
      items: outItems as any,
      endpoint_url: url,
      error: errText || null,
    } as any)
  } catch {}

  return outItems
}

export function normalize(input: any): HealthItem[] {
  if (Array.isArray(input) && input.every(isHealthItemShape)) return input as HealthItem[]
  if (isHealthItemShape(input)) return [input as HealthItem]
  if (input && typeof input === 'object') {
    const out: HealthItem[] = []
    for (const [key, val] of Object.entries(input)) {
      if (val && typeof val === 'object') {
        const v: any = val
        const status = resolveStatus(v)
        out.push({ id: key, label: key, status, detail: v.detail || v.message, ts: v.ts })
      } else if (typeof val === 'boolean') {
        out.push({ id: key, label: key, status: val ? 'ok' : 'error' })
      }
    }
    if (out.length > 0) return out
  }
  return [
    { id: 'health', label: 'Invalid health payload', status: 'warn', detail: 'See Health Guide for response shape' },
  ]
}

export function isHealthItemShape(v: any) {
  return v && typeof v === 'object' && typeof (v as any).id === 'string' && typeof (v as any).label === 'string' && typeof (v as any).status === 'string'
}

export function resolveStatus(v: any): HealthItem['status'] {
  if (typeof v.status === 'string') {
    const s = v.status.toLowerCase()
    if (s === 'ok' || s === 'warn' || s === 'error' || s === 'pending') return s
  }
  if (typeof v.ok === 'boolean') return v.ok ? 'ok' : 'error'
  return 'warn'
}

export function worstStatus(items: HealthItem[]): HealthItem['status'] {
  // Treat any pending as degraded for overall status to avoid ambiguous "pending" histories
  let hasError = false
  let hasWarn = false
  let hasPending = false
  for (const it of items) {
    if (it.status === 'error') { hasError = true; break }
    if (it.status === 'warn') hasWarn = true
    if (it.status === 'pending') hasPending = true
  }
  if (hasError) return 'error'
  if (hasWarn) return 'warn'
  if (hasPending) return 'warn'
  return 'ok'
}
