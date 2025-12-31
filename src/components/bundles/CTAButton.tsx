"use client"
import Link from "next/link"

export default function CTAButton({ slug, href, label }: { slug: string; href?: string; label?: string }) {
  return (
    <div className="mx-auto w-fit">
      <Link
        href={href ?? `/bundle/${slug}`}
        onClick={(e) => e.stopPropagation()}
        className={[
          'inline-flex items-center justify-center rounded-xl whitespace-nowrap py-1 px-4',
          'font-semibold ring-1',
          // Light mode: black button, white text; Dark mode: invert
          'bg-black text-white ring-black/20',
          'dark:bg-white dark:text-black dark:ring-white/30',
          'text-[13px] sm:text-sm md:text-base',
        ].join(' ')}
      >
        {label ?? 'View Bundle →'}
      </Link>
    </div>
  )
}
