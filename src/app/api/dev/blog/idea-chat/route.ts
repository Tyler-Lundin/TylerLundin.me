import { NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth'
import OpenAI from 'openai'
import { withAuditRoute } from '@/lib/audit'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

async function handler(req: Request) {
  try {
    await requireRoles(['admin', 'head_of_marketing', 'head of marketing'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { messages, context } = await req.json()
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const system = `You are a ruthless editor and ideation partner for a dev blogger.
Keep replies short, focused, and easy to scan on a narrow chat UI.

Rules:
- Default to 3–5 ultra-concise bullets or 1–2 short questions.
- Prefer short sentences (under ~12 words); no long paragraphs.
- Avoid prefacing, hedging, or restating the prompt.
- Use plain Markdown bullets; no headings unless critical.
- If suggesting next steps, make them concrete and specific.

Use the provided goal and anchor keywords to explore angles, ask clarifying questions, and converge on a strong thesis while staying brief.`

    const openaiMessages = [
      { role: 'system', content: system },
      { role: 'system', content: `Context: ${JSON.stringify({ goal: context?.goals, anchors: context?.keywords, audience: context?.audience, topic: context?.topic })}` },
      ...(Array.isArray(messages) ? messages : []),
    ]

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: openaiMessages as any,
      temperature: 0.7,
    })

    const reply = completion.choices?.[0]?.message?.content || ''
    return NextResponse.json({ ok: true, reply })
  } catch (err) {
    console.error('Idea chat error:', err)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}

export const POST = withAuditRoute('dev.blog.idea_chat', handler)
