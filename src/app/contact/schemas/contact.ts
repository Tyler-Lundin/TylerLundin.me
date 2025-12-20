import { z } from 'zod'

export const ContactSubmissionSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  subject: z.string().optional().or(z.literal('')),
  message: z.string().min(1),
  budget: z.string().optional().or(z.literal('')),
  source: z.string().optional().or(z.literal('')),
})

export type ContactSubmissionInput = z.infer<typeof ContactSubmissionSchema>

