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
    const { title, brief, tone, points } = await req.json()
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const system = `You are an opinionated web-dev blogger. Write in a concise, confident, first-person style. Use markdown. Include a strong intro, clear sections, and a short conclusion with a call-to-thought.`

    const user = `
Title: ${title || '(generate a strong title)'}
Brief: ${brief || '(no brief)'}
Tone: ${tone || 'direct, practical, experienced'}
Key points:
${Array.isArray(points) ? points.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n') : '(none)'}

Return JSON with fields: { title, excerpt, tags, content_md, reading_time_minutes }.
Tags should be 3-6 lowercase tags. excerpt <= 220 chars. content_md in markdown.
`

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    })

    const raw = completion.choices?.[0]?.message?.content || '{}'
    const data = JSON.parse(raw)
    return NextResponse.json({ ok: true, draft: data })
  } catch (err) {
    console.error('AI Draft error:', err)
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 })
  }
}

