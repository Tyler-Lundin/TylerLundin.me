"use client"

export default function Bullets({ bullets }: { bullets: string[] }) {
  return (
    <ul className="mt-3 sm:mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
      {bullets.map((f) => (
        <li
          key={f}
          className={[
            'rounded-lg bg-white/8 text-white/85 ring-1 ring-white/12',
            'line-clamp-2',
          ].join(' ')}
        >
          {f}
        </li>
      ))}
    </ul>
  )
}

