import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as any
  const analysis = (body && typeof body === 'object') ? body.analysis : null
  const available: string[] = Array.isArray(body?.availableActions) ? body.availableActions : []
  const auto: string[] = []

  const has = (name: string) => available.includes(name)
  const goal = typeof analysis?.goal === 'string' ? analysis.goal.trim() : ''
  const category = typeof analysis?.category === 'string' ? analysis.category : 'Other'

  // Heuristics: prefer creating a topic when there's a clear goal
  if (has('CreateTopic') && goal.length >= 4) auto.push('CreateTopic')
  // Often useful to capture goal as a note
  if (has('SaveNote') && goal.length >= 8) auto.push('SaveNote')
  // If content/seo, suggest drafting next steps
  if (has('DraftNextSteps') && (category === 'ContentOrSEO' || category === 'PlanningOrTaskBreakdown')) auto.push('DraftNextSteps')

  // Dedup and cap
  const out = Array.from(new Set(auto)).slice(0, 4)
  return json({ autoActions: out })
}

function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
}

