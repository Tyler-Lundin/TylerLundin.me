import { NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth'
import OpenAI from 'openai'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

export async function POST(req: Request) {
  try {
    await requireRoles(['admin', 'head_of_marketing', 'head of marketing'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { messages, context } = await req.json()
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const system = `You are a concise ideation partner for a dev blogger. Use the provided goal and optional anchor keywords to explore angles, ask clarifying questions, and converge on a strong thesis. Keep responses short and actionable. Use markdown for emphasis and lists when helpful.`

    const openaiMessages = [
      { role: 'system', content: system },
      { role: 'system', content: `Context: ${JSON.stringify({ goal: context?.goals, anchors: context?.keywords })}` },
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
