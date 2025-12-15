import { getZ } from './zod-adapter'

export async function validateActionCreateBody(body: any) {
  const z = await getZ()
  const schema = z.object({
    threadId: z.string().optional(),
    sourceMessageId: z.string().optional(),
    requestedBy: z.enum(['assistant','user','system']).optional(),
    actions: z.array(z.object({ name: z.string(), params: z.object({}).passthrough().optional() })).nonempty(),
  })
  const res = schema.safeParse(body)
  if (!res.success) throw new Error(res.error.message)
  return res.data
}

export async function validateAckBody(body: any) {
  const z = await getZ()
  const schema = z.object({ acknowledgedBy: z.string().optional() })
  const res = schema.safeParse(body)
  if (!res.success) throw new Error(res.error.message)
  return res.data
}

export async function validateCompleteBody(body: any) {
  const z = await getZ()
  const schema = z.object({ status: z.enum(['succeeded','failed','cancelled']), executedBy: z.string().optional(), statusInfo: z.object({}).passthrough().optional() })
  const res = schema.safeParse(body)
  if (!res.success) throw new Error(res.error.message)
  return res.data
}

export async function validateExecuteBody(body: any) {
  const z = await getZ()
  const schema = z.object({ executor: z.string().optional(), force: z.boolean().optional() })
  const res = schema.safeParse(body)
  if (!res.success) throw new Error(res.error.message)
  return res.data
}

export async function validatePumpBody(body: any) {
  const z = await getZ()
  const schema = z.object({ limit: z.number().optional(), executor: z.string().optional() })
  const res = schema.safeParse(body)
  if (!res.success) throw new Error(res.error.message)
  return res.data
}
