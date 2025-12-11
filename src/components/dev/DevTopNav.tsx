"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dev', label: 'Home' },
  { href: '/dev/blog', label: 'Blog' },
  { href: '/dev/msgs', label: 'Inbox' },
]

export default function DevTopNav() {
  const pathname = usePathname() || '/dev'
  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-sm font-semibold tracking-wide">Developer</div>
        <nav className="text-xs flex items-center gap-1">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || (href !== '/dev' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={
                  'px-3 py-1.5 rounded-md transition-colors ' +
                  (active
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10')
                }
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

