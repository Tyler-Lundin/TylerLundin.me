import { z } from 'zod'

export const QuoteRequestSchema = z.object({
  contact_name: z.string().min(1),
  contact_email: z.string().email(),
  company: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  project_summary: z.string().min(1),
  scope: z.any().optional(),
  budget_min: z.coerce.number().int().nonnegative().optional(),
  budget_max: z.coerce.number().int().nonnegative().optional(),
  currency: z.string().default('USD').optional(),
  timeline: z.string().optional().or(z.literal('')),
  priority: z.string().optional().or(z.literal('')),
  source: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
})

export type QuoteRequestInput = z.infer<typeof QuoteRequestSchema>

