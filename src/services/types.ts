export type ServiceCategory =
  | 'hosting'
  | 'design'
  | 'branding'
  | 'data'
  | 'auth'
  | 'general'

export type ServiceStatus = 'active' | 'draft' | 'hidden'

export type ServiceCTA = {
  label: string
  href: string
}

/**
 * Root definition of a Service. Keep this minimal and stable.
 */
export interface Service {
  /** URL slug and unique identifier, used for routing */
  slug: string
  /** Display title */
  title: string
  /** Short, one–sentence description used in cards/lists */
  summary: string

  /** Optional broader grouping for filtering and organization */
  category?: ServiceCategory
  /** Editorial lifecycle */
  status?: ServiceStatus
  /** Freeform tag list for filtering */
  tags?: string[]
  /** Bullet points highlighting value */
  features?: string[]
  /** Human-readable price summary (e.g. "from $49/mo") */
  priceRange?: string
  /** Primary CTA (defaults can be used if omitted) */
  cta?: ServiceCTA
  /** ISO timestamp of last update */
  updatedAt?: string
}

// BUNDLES

export type BundleBilling = 'monthly' | 'one_time' | 'project'

export interface BundlePrice {
  amount: number
  currency: 'USD'
  cadence: Exclude<BundleBilling, 'project'>
  note?: string
}

export interface Bundle {
  /** Kebab-case slug for routing */
  slug: string
  /** Display name */
  title: string
  /** Short description */
  summary: string
  /** Human-friendly price text (e.g. "from $49/mo") */
  priceRange?: string
  /** Structured price entries (optional) */
  prices?: BundlePrice[]
  /** Suggested billing framing */
  billing?: BundleBilling
  /** Which services are included, by slug */
  serviceSlugs: string[]
  /** Value bullets */
  features?: string[]
  /** Tags for filtering */
  tags?: string[]
  /** Optional CTA */
  cta?: ServiceCTA
  /** Status lifecycle */
  status?: ServiceStatus
  /** ISO timestamp */
  updatedAt?: string
  /** Background Image */
  bgImg?: string
  /** Image Classname Append */
  className?: string
}
