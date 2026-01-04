import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 px-4 py-10">
      <div
        className="
          w-[min(92vw,420px)] sm:w-[380px] md:w-[400px]
          overflow-hidden rounded-md
          border-8 border-neutral-200/80 dark:border-neutral-700/80
          bg-white/95 dark:bg-neutral-900/95
          shadow-lg backdrop-blur-md
        "
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/images/not-found.webp"
            alt="Not Found"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="p-5 grid gap-3">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-wide text-neutral-900 dark:text-white">
              “What stands in the way becomes the way.”
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              This page isn’t here, but the next step is. Head back and keep moving.
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">— Marcus Aurelius</p>
          </div>

          <div className="mt-2 flex gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full px-3.5 py-1.75 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
