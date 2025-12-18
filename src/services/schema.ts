import { z } from 'zod'
import type { Service, Bundle } from './types'

export const serviceCategory = z.enum([
  'hosting',
  'design',
  'branding',
  'data',
  'auth',
  'general'
])

export const serviceStatus = z.enum(['active', 'draft', 'hidden'])

export const serviceSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase kebab-case slug'),
    title: z.string().min(1),
    summary: z.string().min(1),

    category: serviceCategory.optional(),
    status: serviceStatus.default('active').optional(),
    tags: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    priceRange: z.string().optional(),
    cta: z
      .object({
        label: z.string().min(1),
        href: z.string().url().or(z.string().startsWith('/'))
      })
      .optional(),
    updatedAt: z.string().datetime().optional()
  })
  .strict()

export type ServiceValidated = z.infer<typeof serviceSchema>

export const servicesTableSchema = z.array(serviceSchema)

// Ensure structural parity between types and schema at compile time
// (This is a no-op at runtime, purely for TS help.)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typecheck: Service extends ServiceValidated ? true : never = true

// BUNDLES

export const bundleBilling = z.enum(['monthly', 'one_time', 'project'])

export const bundlePrice = z.object({
  amount: z.number().positive(),
  currency: z.literal('USD'),
  cadence: z.enum(['monthly', 'one_time']),
  note: z.string().optional()
})

export const bundleSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase kebab-case slug'),
    title: z.string().min(1),
    summary: z.string().min(1),
    priceRange: z.string().optional(),
    prices: z.array(bundlePrice).optional(),
    billing: bundleBilling.optional(),
    serviceSlugs: z.array(z.string()).min(1),
    features: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    cta: z
      .object({
        label: z.string().min(1),
        href: z.string().url().or(z.string().startsWith('/'))
      })
      .optional(),
    status: serviceStatus.optional(),
    updatedAt: z.string().datetime().optional(),
    bgImg: z.string().optional(),
    className: z.string().optional(),
  })
  .strict()

export type BundleValidated = z.infer<typeof bundleSchema>
export const bundlesTableSchema = z.array(bundleSchema)

// Type-level parity check
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _bundleTypecheck: Bundle extends BundleValidated ? true : never = true
