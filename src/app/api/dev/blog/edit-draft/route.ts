import { NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth'
import OpenAI from 'openai'
import { withAuditRoute } from '@/lib/audit'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

async function handler(req: Request) {
  try {
    await requireRoles(['admin', 'head_of_marketing', 'head of marketing', 'owner'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { draft, messages, context } = await req.json()
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const system = `You are an expert editor for a dev blog draft. Apply the user's requested edits precisely with minimal necessary changes. Maintain the author's voice and structure. Always return valid JSON.`

    const user = `
Current draft (JSON):
${JSON.stringify(draft || {}, null, 2)}

Context (optional): ${JSON.stringify(context || {})}

Instructions: Read the conversation and update the draft accordingly.
Return JSON strictly as: { reply: string, draft: { title?, excerpt?, tags?, content_md?, reading_time_minutes? } }
Keep reply short, describing what changed.
`

    const chatMessages = [
      { role: 'system', content: system },
      { role: 'user', content: user },
      ...(Array.isArray(messages) ? messages : []),
    ] as any

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: chatMessages,
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const raw = completion.choices?.[0]?.message?.content || '{}'
    const data = JSON.parse(raw)
    const updatedDraft = data?.draft || draft
    const reply = data?.reply || 'Applied updates.'

    return NextResponse.json({ ok: true, reply, draft: updatedDraft })
  } catch (err) {
    console.error('Edit-draft error:', err)
    return NextResponse.json({ error: 'Failed to apply edits' }, { status: 500 })
  }
}

export const POST = withAuditRoute('dev.blog.edit_draft', handler)
