// Mobile-first controls: bottom thumb zones + optional center pill.
// - On mobile: buttons sit bottom corners, compact, high-contrast.
// - On sm+: returns to side/middle placement if you want (kept subtle).
export default function SpotlightBundlesControls({
  prev,
  next,
  index,
  total,
}: {
  prev: () => void
  next: () => void
  index?: number // 0-based optional
  total?: number // optional
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {/* Mobile: bottom controls */}
      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 sm:hidden">
        <div className="relative flex items-center justify-between">
          <NavButtonMobile dir="left" label="Previous" onClick={prev} />
          <CenterPill index={index} total={total} />
          <NavButtonMobile dir="right" label="Next" onClick={next} />
        </div>
      </div>

      {/* Desktop/tablet: subtle side controls (optional) */}
      <div className="hidden sm:block absolute inset-0">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 flex items-center justify-between">
          <NavButtonDesktop dir="left" label="Previous" onClick={prev} />
          <NavButtonDesktop dir="right" label="Next" onClick={next} />
        </div>
      </div>
    </div>
  )
}

function CenterPill({ index, total }: { index?: number; total?: number }) {
  if (typeof index !== 'number' || typeof total !== 'number' || total <= 0) return <span />
  return (
    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
      <div className="rounded-full bg-black/55 dark:bg-black/55 ring-1 ring-white/12 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
        {index + 1} / {total}
      </div>
    </div>
  )
}

/* ---------------- Mobile Buttons ---------------- */

function NavButtonMobile({
  dir,
  label,
  onClick,
}: {
  dir: 'left' | 'right'
  label: string
  onClick: () => void
}) {
  const isLeft = dir === 'left'
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        'pointer-events-auto select-none',
        // thumb-friendly but not huge
        'h-10 w-12',
        'rounded-2xl',
        // “poster” glass feel
        'bg-black/55 dark:bg-black/60',
        'ring-1 ring-white/15',
        'backdrop-blur-md',
        'shadow-[0_12px_30px_rgba(0,0,0,0.35)]',
        'grid place-items-center',
        // tactile
        'active:scale-[0.96]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40',
        // nudge to edges a hair
        isLeft ? 'pr-[1px]' : 'pl-[1px]',
      ].join(' ')}
    >
      <Chevron dir={dir} />
    </button>
  )
}

/* ---------------- Desktop Buttons ---------------- */

function NavButtonDesktop({
  dir,
  label,
  onClick,
}: {
  dir: 'left' | 'right'
  label: string
  onClick: () => void
}) {
  const isLeft = dir === 'left'
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        'pointer-events-auto select-none',
        'h-12 w-12',
        'rounded-2xl',
        'bg-white/45 dark:bg-black/45',
        'border border-black/15 dark:border-white/15',
        'shadow-[0_10px_30px_rgba(0,0,0,0.25)]',
        'grid place-items-center',
        'active:scale-[0.96]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30',
        isLeft ? '-translate-x-1' : 'translate-x-1',
      ].join(' ')}
    >
      <Chevron dir={dir} />
    </button>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  const isLeft = dir === 'left'
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="text-white/90"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isLeft ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}

