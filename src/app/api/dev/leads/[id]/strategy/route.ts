import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/auth'
import { getAdminClient } from '@/lib/leadgen/supabaseServer'
import OpenAI from 'openai'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(['admin', 'owner'])
    const { id } = await params
    const supa = getAdminClient()

    // 1. Fetch Lead Data
    const { data: lead, error: fetchErr } = await supa
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    // 2. Generate Strategy with OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const prompt = `You are an expert sales strategist for a web development agency.
    Analyze this local business lead and generate a concise "Pitch Strategy" to win them as a client.
    
    Business Name: ${lead.name}
    Niche: ${lead.niche}
    Location: ${lead.location}
    Current Website: ${lead.website || 'None'}
    Google Rating: ${lead.rating} (${lead.user_ratings_total} reviews)
    Business Types: ${lead.types?.join(', ')}
    
    Return a JSON object with:
    - "hook": A 1-sentence opening hook for an email.
    - "pain_points": [Array of 3 potential pain points based on their data].
    - "value_prop": A specific value proposition for a new website or redesign.
    - "suggested_cta": A clear next step.
    
    Make it highly specific to their niche and status. If they have no website, focus on visibility. If they have one, focus on conversion/modernization.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })

    const strategy = JSON.parse(completion.choices[0].message.content || '{}')

    // 3. Save Strategy to Lead
    const { error: updateErr } = await supa
      .from('leads')
      .update({ strategy })
      .eq('id', id)

    if (updateErr) throw updateErr

    // 4. Log event
    await supa.from('lead_events').insert({
      lead_id: id,
      type: 'strategy_generated',
      payload: strategy
    })

    return NextResponse.json({ strategy })
  } catch (e: any) {
    console.error('[Strategy API] Error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to generate strategy' }, { status: 500 })
  }
}
