import { NextRequest } from 'next/server'
import { type AnkrStep1Response } from '@/lib/ankr/config'
import { runStep1 } from '@/lib/ankr/step1'
import { runStep2 } from '@/lib/ankr/step2'

type ChatBody = {
  threadId?: string
  message: string
  attachTopicIds?: string[]
  includePrevThreads?: boolean
  includeThreadMessages?: boolean
  threadMessagesLimit?: number
  mode?: 'idea' | 'action'
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as ChatBody | null
  if (!body || !body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
    return json({ error: { code: 'BAD_REQUEST', message: 'message is required' } }, 400)
  }

  // Step 1: run extracted analyzer
  const step1: AnkrStep1Response = await runStep1({ message: body.message, threadId: body.threadId || undefined })

  // Step 2 (foundation): log inputs cleanly for now
  await runStep2(step1)

  // Return step 1 output unchanged for API compatibility
  return json(step1, 200)
}

function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
}

