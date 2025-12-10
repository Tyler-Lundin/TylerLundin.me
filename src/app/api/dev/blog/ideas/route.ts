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
    const body = await req.json()
    const { topic, goals, audience, keywords } = body
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const system = `You help a dev write opinionated blog topics. Return compact JSON ideas.`
    const user = `Topic: ${topic}\nGoals: ${goals}\nAudience: ${audience}\nKeywords: ${(keywords || []).join(', ')}\nReturn JSON: { ideas: [{ title, angle, key_points: string[] }] } with 5 options.`

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const raw = completion.choices?.[0]?.message?.content || '{}'
    const data = JSON.parse(raw)
    return NextResponse.json({ ok: true, ...data })
  } catch (err) {
    console.error('Ideas error:', err)
    return NextResponse.json({ error: 'Failed to suggest ideas' }, { status: 500 })
  }
}

