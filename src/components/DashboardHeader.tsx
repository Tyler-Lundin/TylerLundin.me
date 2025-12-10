import { useState, useEffect } from "react";

interface DashboardHeaderProps {
  title: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  const [authOk, setAuthOk] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/auth/verify-token')
      .then((r) => r.json())
      .then((d) => { if (mounted) setAuthOk(!!d?.success) })
      .catch(() => { if (mounted) setAuthOk(false) })
    return () => { mounted = false }
  }, [])
  const handleSignOut = () => {
    fetch('/api/auth/logout', { method: 'POST' })
      .catch(() => {})
      .finally(() => {
        window.location.href = '/login'
      })
  };

  return (
    <header className="fixed top-0 z-40 w-full border-b border-neutral-200/70 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-14 items-center gap-4 px-3 sm:h-16 sm:px-6 lg:px-8">
        {/* Left: brand + title */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-xs font-semibold tracking-wide text-white dark:bg-neutral-100 dark:text-neutral-900">
            TW
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
              Dashboard
            </span>
            <h1 className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50 sm:text-base">
              {title}
            </h1>
          </div>
        </div>

        {/* Center reserved space for system status, breadcrumbs, etc. */}
        <div className="hidden md:flex flex-1 items-center justify-center text-xs text-neutral-500 dark:text-neutral-400">
          {/* Reserved */}
        </div>

        {/* Right: search + user actions */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Auth indicator + env */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className={`inline-block h-2 w-2 rounded-full ${authOk === null ? 'bg-yellow-400' : authOk ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="uppercase tracking-wide">{process.env.NODE_ENV?.toUpperCase?.() || 'ENV'}</span>
          </div>
          {/* Compact search hint */}
          <button
            type="button"
            className="hidden items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-medium text-neutral-500 shadow-sm transition-colors hover:border-neutral-300 hover:text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-200 sm:inline-flex"
          >
            <span className="rounded-sm border border-neutral-300 px-1 text-[10px] font-semibold text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
              ⌘K
            </span>
            <span className="hidden md:inline">Search</span>
            <span className="md:hidden">Search</span>
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            type="button"
            className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
          >
            Sign out
          </button>
        </div>

        {/* Mobile reserved strip (no navigation; DevDock handles nav) */}
        <div className="pointer-events-none -mx-3 mt-14 h-0 md:hidden" />
      </div>
    </header>
  );
}
