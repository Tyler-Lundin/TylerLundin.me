import { NextResponse } from 'next/server'

// Simple mock health endpoint for local testing
export async function GET(req: Request) {
  const expected = process.env.DEV_HEALTH_KEY || process.env.CRON_SECRET || ''
  const got = req.headers.get('x-health-key') || ''
  if (expected && got !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const items = [
    { id: 'app', label: 'App Route', status: 'ok', detail: 'Mock health route alive', ts: new Date().toISOString() },
    { id: 'db', label: 'Database', status: 'ok', detail: 'Simulated DB check' },
    { id: 'queue', label: 'Background Jobs', status: 'warn', detail: '2 delayed jobs' },
  ]
  return NextResponse.json(items)
}

