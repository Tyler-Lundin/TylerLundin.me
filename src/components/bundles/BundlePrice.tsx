"use client"

export default function BundlePrice({ priceText }: { priceText: string }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-md",
        "text-sm font-bold",
        // Text color
        "text-emerald-700 dark:text-emerald-400",
        // Background and Border
        "bg-white dark:bg-black",
        "border border-emerald-200 dark:border-emerald-800",
        // The "Glow" effect
        "shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]",
        "tabular-nums"
      ].join(" ")}
    >
      {priceText}
    </span>
  )
}
