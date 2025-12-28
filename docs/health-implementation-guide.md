# Health Endpoint Implementation Guide

This guide describes how each external project should expose a secure, normalized `/health` endpoint so the Dev Health Terminal can fetch and display diagnostic checks.

## Overview

- Your project exposes `GET /health` that returns a JSON payload describing health checks.
- Our Dev app calls your endpoint from a server-side proxy with a shared secret header.
- Results render in the Health Terminal UI and can be refreshed on demand.

## Authentication

Use a shared secret header. The Dev app sends:

- Header: `X-Health-Key: <secret>`

Recommended options:

- Per-project secret (best): Each project stores its own secret. Rotate independently.
- Single shared secret (simple): Same value in all projects and the Dev app.

Optionally, use HMAC with timestamp to prevent replays:

- Headers: `X-Health-Key`, `X-Timestamp`, `X-Health-Signature`
- Signature: `HMAC_SHA256(secret, projectId + ":" + timestamp)`
- Reject if timestamp is older than 5 minutes.

## Response Schema

The Dev app accepts an array of items or a map and normalizes:

Array (preferred):

```
[
  { "id": "db", "label": "Database", "status": "ok", "detail": "Connected", "ts": "2025-01-01T00:00:00Z" },
  { "id": "queue", "label": "Background Queue", "status": "warn", "detail": "2 delayed jobs" }
]
```

Status values: `ok`, `warn`, `error`, `pending`.

Map (also accepted):

```
{
  "db": { "ok": true, "detail": "Connected" },
  "queue": { "status": "warn", "detail": "2 delayed jobs" }
}
```

Booleans are interpreted as `ok: true/false`.

## Minimal Checks to Include

- `db`: Connection to primary database
- `auth`: Auth middleware or token verification path
- `queue` or `jobs`: Background processing status (if applicable)
- `cache` or `redis`: Cache availability (if applicable)
- `integrations`: External APIs critical to runtime

## Examples

### Node (Express)

```ts
import express from 'express'
const app = express()

const HEALTH_KEY = process.env.HEALTH_KEY || ''

app.get('/health', async (req, res) => {
  if (HEALTH_KEY && req.header('X-Health-Key') !== HEALTH_KEY) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const checks = [] as any[]

  // Database example
  try {
    await db.ping() // replace with real check
    checks.push({ id: 'db', label: 'Database', status: 'ok', detail: 'Connected' })
  } catch (e: any) {
    checks.push({ id: 'db', label: 'Database', status: 'error', detail: e?.message || 'DB error' })
  }

  // Add more checks...

  res.json(checks)
})

app.listen(3000)
```

### Next.js (Route Handler)

```ts
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const key = process.env.HEALTH_KEY || ''
  if (key) {
    const hdr = req.headers.get('x-health-key')
    if (hdr !== key) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const items = [] as any[]
  // TODO: add real checks
  items.push({ id: 'app', label: 'App Boot', status: 'ok', detail: 'Route handler alive' })
  return NextResponse.json(items)
}
```

### Deno/Fresh or Cloudflare Workers

```ts
export default {
  async fetch(req: Request) {
    const key = (globalThis as any).HEALTH_KEY || ''
    if (key && req.headers.get('x-health-key') !== key) return new Response('unauthorized', { status: 401 })
    const payload = [ { id: 'runtime', label: 'Runtime', status: 'ok', detail: 'Worker up' } ]
    return new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } })
  }
}
```

## Operational Notes

- Keep the endpoint fast. Aim for < 3s. Use timeouts internally.
- Avoid heavy dependencies; cache non-critical checks for a few seconds internally if needed.
- Never leak secrets. Do not echo the provided key or environment variables.
- Use the same response structure across environments for consistency.

## Wiring in the Dev App (already done)

- Dev app stores per-project `project_health_url`, `project_health_secret`, and `project_health_enabled`.
- A proxy at `GET /api/dev/projects/:id/health` calls your endpoint with `X-Health-Key`.
- The Project page renders a Health Terminal that calls the proxy on demand.

## Enabling a Project

1. In your project, implement `/health` as above and set `HEALTH_KEY`.
2. In the Dev app, set on the project:
   - `project_health_enabled = true`
   - `project_health_url` to your endpoint
   - `project_health_secret` to the same `HEALTH_KEY` value
3. Open `/dev/projects/<slug>` and click “Run checks”.

## Troubleshooting

- 401 Unauthorized: Secrets mismatch or header missing.
- Timeout: Endpoint too slow. Add internal timeouts and optimize I/O.
- Invalid payload: Ensure array of items or object map per schema above.

