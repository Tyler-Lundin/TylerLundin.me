'use server'

import { QuoteRequestSchema } from '../schemas/quote'
import { createServiceClient } from '@/lib/supabase/server'

export async function submitQuote(input: unknown) {
  const parsed = QuoteRequestSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'invalid_input', issues: parsed.error.issues }
  }
  const sb: any = await createServiceClient()
  const { data, error } = await sb
    .from('quote_requests')
    .insert({
      contact_name: parsed.data.contact_name,
      contact_email: parsed.data.contact_email,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      project_summary: parsed.data.project_summary,
      scope: parsed.data.scope ?? null,
      budget_min: parsed.data.budget_min ?? null,
      budget_max: parsed.data.budget_max ?? null,
      currency: parsed.data.currency ?? 'USD',
      timeline: parsed.data.timeline || null,
      priority: parsed.data.priority || null,
      source: parsed.data.source || null,
      tags: parsed.data.tags ?? null,
      status: 'new',
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: 'db_error', details: error.message }
  return { ok: true, id: data?.id }
}

