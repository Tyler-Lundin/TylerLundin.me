"use client"

export default function BundleSummary({ summary }: { summary: string }) {
  return (
    <p
      className={[
        'text-xs sm:text-sm font-light pb-2 text-center',
      ].join(' ')}
    >
      {summary}
    </p>
  )
}

