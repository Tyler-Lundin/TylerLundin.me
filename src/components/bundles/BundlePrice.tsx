"use client"

export default function BundlePrice({ priceText }: { priceText: string }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 ",
        "text-sm sm:text-base font-extrabold",
        "tracking-tight text-black dark:text-white",
      ].join(" ")}
    >
      {priceText}
    </span>
  )
}

