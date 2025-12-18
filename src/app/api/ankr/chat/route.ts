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

  // Step 2: generate an assistant response via OpenAI (if enabled)
  const step2 = await runStep2({ step1, originalMessage: body.message, mode: body.mode || 'action' })

  // Return assistant content along with step 1 analysis for transparency
  return json({
    threadId: step1.threadId,
    assistantContent: step2.assistantContent,
    plan: step2.plan,
    intent: step1.intent,
    messageAnalysis: step1.messageAnalysis,
    telemetry: step1.telemetry,
  }, 200)
}

function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
}
