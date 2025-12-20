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
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-[#3F4147] bg-[#1E1F22]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-sm font-semibold tracking-wide text-[#B5BAC1]">Developer</div>
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
                    ? 'bg-[#5865F2] text-white'
                    : 'text-[#B5BAC1] hover:bg-[#383A40]')
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
