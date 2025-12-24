"use client"

export default function BundleTitle({ title }: { title: string }) {
  return (
    <h3
      className={[
        'font-extrabold tracking-tight text-white ',
        'text-xl sm:text-3xl leading-[1.0]',
      ].join(' ')}
    >
      {title}
    </h3>
  )
}

