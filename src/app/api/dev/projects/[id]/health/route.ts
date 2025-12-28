import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { runHealthForProject } from '@/lib/health/run'

type HealthItem = {
  id: string
  label: string
  status: 'ok' | 'warn' | 'error' | 'pending'
  detail?: string
  link?: string
  ts?: string
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const items = await runHealthForProject(id)
    return NextResponse.json(items)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
