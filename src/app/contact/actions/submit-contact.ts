'use server'

import { z } from 'zod'
import { ContactSubmissionSchema } from '../schemas/contact'
import { createServiceClient } from '@/lib/supabase/server'

export async function submitContact(input: unknown) {
  const parsed = ContactSubmissionSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'invalid_input', issues: parsed.error.issues }
  }
  const sb: any = await createServiceClient()
  const { data, error } = await sb
    .from('contact_submissions')
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
      budget: parsed.data.budget || null,
      source: parsed.data.source || null,
      status: 'new',
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: 'db_error', details: error.message }
  return { ok: true, id: data?.id }
}

