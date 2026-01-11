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
    const body = await req.json()
    const { goals, keywords } = body || {}

    // Allow generous goal length; model will still handle summarization
    const cleanGoal = (input: any) => (String(input || '')).replace(/\s+/g, ' ').trim().slice(0, 4000)
    const cleanKeywords = (arr: any): string[] => {
      const src = Array.isArray(arr) ? arr : []
      const out: string[] = []
      for (const raw of src) {
        const k = String(raw || '')
          .toLowerCase()
          .replace(/[#]+/g, '')
          .trim()
          .replace(/[^a-z0-9\-\s]/g, '')
          .replace(/\s+/g, ' ')
        if (k && !out.includes(k)) out.push(k)
      }
      return out.slice(0, 8)
    }
    const cleanedGoals = cleanGoal(goals)
    const cleanedKeywords = cleanKeywords(keywords)
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const system = `You help a dev generate opinionated blog ideas. Keep it flexible and creative, but return a compact JSON payload.`
    const user = `Goal: ${cleanedGoals || '(unspecified)'}\nAnchors (optional): ${(cleanedKeywords || []).join(', ') || '(none)'}\nReturn JSON: { ideas: [{ title, angle?, key_points?: string[] }] } with ~5 options. Keep titles punchy, angles concise, and points actionable.`

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

export const POST = withAuditRoute('dev.blog.ideas', handler)
