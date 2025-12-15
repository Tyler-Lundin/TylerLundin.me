import type { SupabaseClient } from '@supabase/supabase-js'
import { ANKR_CONFIG, type AnkrAnalysis, type ActionProposal } from '@/lib/ankr/config'
import { flagIntents } from '@/lib/ankr/openai'

export type ChatRequestPayload = {
  threadId?: string
  message: string
  attachTopicIds?: string[]
  includePrevThreads?: boolean
  includeThreadMessages?: boolean
  threadMessagesLimit?: number
  mode?: 'idea' | 'action'
}

export type ChatPipelineResult = {
  threadId: string
  userMessageId: string
  assistantMessageId: string
  assistantContent: string
  citations: string[]
  analysis: AnkrAnalysis
  recommendedActions: ActionProposal[]
  retrievalPreview: { id: string; source: string | null; excerpt: string }[]
  decision?: string
  telemetry: { candidatesCount: number; topSource: string | null; model: string; totalMs: number }
  intentFlags?: string[]
}

// Reset pipeline: keep only STEP 1 (intent), return minimal structure.
export async function handleChatPipeline(_supabase: SupabaseClient<any, any, any>, payload: ChatRequestPayload, _logger?: (line: string) => void): Promise<ChatPipelineResult> {
  const t0 = Date.now()
  const flags = await flagIntents({ text: payload.message, allowed: ANKR_CONFIG.intentFlags, contextHints: [] }).catch(() => [])
  const analysis: AnkrAnalysis = { category: 'Other', goal: '', relatedTo: [], confidence: 0 }
  return {
    threadId: payload.threadId || 'new',
    userMessageId: '',
    assistantMessageId: '',
    assistantContent: '',
    citations: [],
    analysis,
    recommendedActions: [],
    retrievalPreview: [],
    telemetry: { candidatesCount: 0, topSource: null, model: 'synth', totalMs: Date.now() - t0 },
    intentFlags: flags,
  }
}

