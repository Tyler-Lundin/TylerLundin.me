"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dev', label: 'Home' },
  { href: '/dev/leads', label: 'Leads' },
  { href: '/dev/blog', label: 'Blog' },
  { href: '/dev/msgs', label: 'Inbox' },
]

export default function DevTopNav() {
  const pathname = usePathname() || '/dev'
  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">Developer</div>
        <nav className="text-xs flex items-center gap-1">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || (href !== '/dev' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={
                  'px-3 py-1.5 rounded-md transition-colors font-medium ' +
                  (active
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white')
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
