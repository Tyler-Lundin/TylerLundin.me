"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react" // Assuming you have lucide-react installed

export default function CTAButton({ slug, href, label }: { slug: string; href?: string; label?: string }) {
  return (
    <div className="mx-auto w-fit">
      <Link
        href={href ?? `/bundle/${slug}`}
        onClick={(e) => e.stopPropagation()}
        className={[
          "group relative inline-flex items-center gap-2 justify-center rounded-xl whitespace-nowrap py-2 px-5",
          "text-[13px] sm:text-sm font-bold transition-all duration-300",
          // Light Mode
          "bg-white border border-emerald-200 text-emerald-700 shadow-sm",
          "hover:border-emerald-400 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]",
          // Dark Mode
          "dark:bg-black dark:border-emerald-800 dark:text-emerald-400",
          "dark:hover:border-emerald-500 dark:hover:shadow-[0_0_20px_-5px_rgba(52,211,153,0.2)]",
        ].join(" ")}
      >
        <span>{label ?? "View Bundle"}</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  )
}
