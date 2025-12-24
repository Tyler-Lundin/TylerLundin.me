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
          'bg-white text-black font-semibold ring-1 ring-white/30',
          'text-[13px] sm:text-sm md:text-base',
        ].join(' ')}
      >
        {label ?? 'View Bundle →'}
      </Link>
    </div>
  )
}

