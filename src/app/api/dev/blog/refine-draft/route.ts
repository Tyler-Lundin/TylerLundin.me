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
    const body = await req.json()
    const draft = body?.draft || {}
    const context = body?.context || {}

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const system = `You propose surgical improvements to a blog draft. Return JSON with discrete changes that can be individually applied. Avoid reformatting unrelated text.`

    const user = `
Context: ${JSON.stringify(context)}
Current draft:
title: ${draft.title || ''}
excerpt: ${draft.excerpt || ''}
tags: ${(draft.tags || []).join(', ')}
content_md:
---
${draft.content_md || ''}
---

Return JSON: { changes: Change[] }
Where Change =
  | { id: string, field: 'title' | 'excerpt', before: string, after: string, rationale: string }
  | { id: string, field: 'tags', before: string[], after: string[], rationale: string }
  | { id: string, field: 'content_md', kind: 'replace', before_snippet: string, after_snippet: string, rationale: string }
Rules:
- Keep changes minimal and precise.
- Use before_snippet that exactly exists in content_md to allow safe string replacement.
- Provide 5-12 changes total.
`

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const raw = completion.choices?.[0]?.message?.content || '{}'
    const data = JSON.parse(raw)
    const changes = Array.isArray(data?.changes) ? data.changes : []
    return NextResponse.json({ ok: true, changes })
  } catch (err) {
    console.error('Refine-draft error:', err)
    return NextResponse.json({ error: 'Failed to refine draft' }, { status: 500 })
  }
}

export const POST = withAuditRoute('dev.blog.refine_draft', handler)
