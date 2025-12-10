import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import OpenAI from 'openai'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

export async function POST(req: Request) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { messages, context } = await req.json()
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const system = `You are a concise ideation partner for a dev blogger. Ask sharp questions, propose angles, and converge on a strong thesis. Keep responses short and actionable.`

    const openaiMessages = [
      { role: 'system', content: system },
      { role: 'system', content: `Context: ${JSON.stringify(context || {})}` },
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

