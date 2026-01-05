import { NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth'
import OpenAI from 'openai'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

function cleanGoal(input: any) {
  return String(input || '').replace(/\s+/g, ' ').trim().slice(0, 4000)
}

function cleanKeywords(input: any): string[] {
  const src = String(input || '')
  const tokens = src
    .split(',')
    .map((t) => String(t || '').toLowerCase().replace(/[#]+/g, '').trim())
    .map((t) => t.replace(/[^a-z0-9\-\s]/g, ''))
    .map((t) => t.replace(/\s+/g, ' '))
    .filter(Boolean)
  const dedup: string[] = []
  for (const t of tokens) if (!dedup.includes(t)) dedup.push(t)
  return dedup.slice(0, 8)
}

export async function POST(req: Request) {
  try {
    await requireRoles(['admin', 'head_of_marketing', 'head of marketing'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const field = String(body?.field || 'goal') as 'goal' | 'keywords'
    const value = String(body?.value || '')
    const goal = cleanGoal(field === 'goal' ? value : body?.context?.goal)
    const anchorsArr = field === 'keywords' ? cleanKeywords(value) : cleanKeywords((body?.context?.anchors || []).join(', '))
    const anchors = anchorsArr.join(', ')

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const system = field === 'goal'
      ? 'You refine a blog post goal into sharper variants. Keep intent, improve clarity, be concise. Return JSON.'
      : 'You refine keyword lists into better anchor keywords. Keep 3-8, relevant, concise. Return JSON.'

    const user = field === 'goal'
      ? `Goal: ${goal}\nAnchors (optional): ${anchors || '(none)'}\nReturn JSON: { suggestions: string[] } with 3-5 improved rephrases.`
      : `Current anchors: ${anchors}\nGoal (optional): ${goal || '(none)'}\nReturn JSON: { suggestions: string[] } with 3-5 improved comma-separated lists. Keep each list 3-8 keywords total.`

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    })

    const raw = completion.choices?.[0]?.message?.content || '{}'
    const data = JSON.parse(raw)
    const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : []
    return NextResponse.json({ ok: true, suggestions })
  } catch (err) {
    console.error('Refine error:', err)
    return NextResponse.json({ error: 'Failed to refine' }, { status: 500 })
  }
}
