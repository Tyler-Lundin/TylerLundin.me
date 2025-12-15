import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function sse(data: any, event: string = 'message') {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase: any = await createServiceClient()
  const { id } = await params
  if (!id) return new Response('Missing id', { status: 400 })

  const encoder = new TextEncoder()
  let closed = false
  let lastStatus: string | null = null

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Helper to push event
      const push = (evt: any, type = 'message') => controller.enqueue(encoder.encode(sse(evt, type)))

      // Initial fetch
      try {
        const { data, error } = await supabase
          .from('ankr_action_calls')
          .select('id, status, action_name')
          .eq('id', id)
          .single()
        if (error) {
          push({ error: { code: 'DB_FETCH_FAILED', message: error.message } }, 'error')
          controller.close();
          return
        }
        lastStatus = data?.status || 'requested'
        push({ id, status: lastStatus })
      } catch (e: any) {
        push({ error: { code: 'INIT_FAILED', message: String(e?.message || e) } }, 'error')
        controller.close();
        return
      }

      // Heartbeat
      let heartbeat: any = setInterval(() => {
        if (!closed) push({ ts: Date.now() }, 'ping')
      }, 15000)

      // Poll with backoff until terminal or timeout (~15-20s)
      const delays = [800, 1000, 1200, 1500, 1800, 2200, 2600, 3000, 3500, 4000]
      let attempt = 0
      const terminal = new Set(['succeeded', 'failed', 'cancelled'])

      const loop = async () => {
        if (closed) return
        try {
          const { data } = await supabase
            .from('ankr_action_calls')
            .select('status, status_info, action_name')
            .eq('id', id)
            .single()
          const status = data?.status || 'requested'
          if (status !== lastStatus) {
            lastStatus = status
            push({ id, status, status_info: data?.status_info || null, action_name: data?.action_name || null })
          }
          if (terminal.has(status)) {
            clearInterval(heartbeat)
            push({ id, status, status_info: data?.status_info || null, action_name: data?.action_name || null }, 'end')
            controller.close()
            return
          }
        } catch {}

        attempt += 1
        if (attempt >= 10) {
          clearInterval(heartbeat)
          push({ id, status: lastStatus, timeout: true }, 'end')
          controller.close()
          return
        }
        const d = delays[Math.min(attempt, delays.length - 1)]
        setTimeout(loop, d)
      }

      setTimeout(loop, 1200)
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
