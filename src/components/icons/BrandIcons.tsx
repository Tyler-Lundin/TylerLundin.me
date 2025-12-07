import { cn } from '@/lib/utils'

export function VercelIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('h-5 w-5', className)}>
      <path d="M12 3L22 21H2L12 3Z" fill="currentColor" />
    </svg>
  )
}

export function CloudflareIcon({ className }: { className?: string }) {
  // Simplified cloud glyph in Cloudflare orange
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('h-5 w-5', className)}>
      <path
        d="M7 17a4 4 0 1 1 0-8c.3 0 .6.03.88.09A6 6 0 0 1 19 11c1.66 0 3 1.34 3 3s-1.34 3-3 3H7Z"
        fill="#F38020"
      />
    </svg>
  )
}

export function PhotoshopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('h-5 w-5', className)}>
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#001E36" />
      <text x="6.6" y="16" fontSize="9" fontWeight="700" fill="#31A8FF">Ps</text>
    </svg>
  )
}

export function SupabaseIcon({ className }: { className?: string }) {
  // Simplified Supabase mark using two offset triangles
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('h-5 w-5', className)}>
      <path d="M12 2l7 10h-5l5 10-14-10h5L5 2h7Z" fill="#3ECF8E" />
    </svg>
  )
}

