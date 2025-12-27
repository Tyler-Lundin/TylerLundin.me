"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Menu, X } from 'lucide-react'
import { useState } from 'react'

function titleize(segment: string) {
  try {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  } catch {
    return segment
  }
}

export default function DevBreadcrumbs() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const parts = (pathname || '/').split('/').filter(Boolean)

  // Expect paths like: ["dev", ...]
  const devIndex = parts.indexOf('dev')
  const trail = devIndex >= 0 ? parts.slice(devIndex + 1) : []

  return (
    <div className="max-w-7xl fixed top-2  left-2 right-2 mx-auto px-2 p-1 mb-3 bg-white dark:bg-black z-[500] rounded-lg border border-black/25 border-white/25">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dev" aria-label="Dev Home" className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[#DBDEE1] hover:border-[#4b4e55]">
            <Home className="h-3.5 w-3.5" />
          </Link>
          {trail.map((seg, i) => {
            const href = `/${['dev', ...trail.slice(0, i + 1)].join('/')}`
            return (
              <span key={href} className="inline-flex items-center gap-2">
                <span className="opacity-40">/</span>
                {i < trail.length - 1 ? (
                  <Link href={href} className="text-[#DBDEE1] hover:underline">{titleize(seg)}</Link>
                ) : (
                  <span className="text-[#949BA4]">{titleize(seg)}</span>
                )}
              </span>
            )
          })}
        </div>
        {/* Right-side quick nav (desktop) */}
        <nav className="hidden sm:flex items-center gap-3 text-sm">
          <Link href="/dev/clients" className="underline text-[#DBDEE1]">Clients</Link>
          <span className="opacity-40">/</span>
          <Link href="/dev/projects" className="underline text-[#DBDEE1]">Projects</Link>
          <span className="opacity-40">/</span>
          <Link href="/dev/invitations" className="underline text-[#DBDEE1]">Invitations</Link>
          <span className="opacity-40">/</span>
          <Link href="/dev/services" className="underline text-[#DBDEE1]">Services</Link>
          <span className="opacity-40">/</span>
          <Link href="/dev/blog" className="underline text-[#DBDEE1]">Blog</Link>
          <span className="opacity-40">/</span>
          <Link href="/dev/team" className="underline text-[#DBDEE1]">Team</Link>
          <span className="opacity-40">/</span>
          <Link href="/dev/msgs" className="underline text-[#DBDEE1]">Messages</Link>
        </nav>
        {/* Mobile menu trigger */}
        <button
          aria-label="Open dev menu"
          onClick={() => setOpen(true)}
          className="sm:hidden inline-flex items-center justify-center h-7 w-7 rounded-md border border-[#3F4147] bg-[#1E1F22] text-[#DBDEE1]"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile overlay menu */}
      {open && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close dev menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="absolute right-4 top-4 w-[85vw] max-w-sm rounded-xl border border-[#3F4147] bg-[#1E1F22] shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2b30]">
              <div className="text-sm text-[#DBDEE1]">Navigate</div>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-[#B5BAC1] hover:bg-[#2a2b30] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 text-sm">
              {[
                { href: '/dev/clients', label: 'Clients' },
                { href: '/dev/projects', label: 'Projects' },
                { href: '/dev/invitations', label: 'Invitations' },
                { href: '/dev/services', label: 'Services' },
                { href: '/dev/blog', label: 'Blog' },
                { href: '/dev/team', label: 'Team' },
                { href: '/dev/msgs', label: 'Messages' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-transparent hover:border-[#3F4147] bg-[#232428] hover:bg-[#26272b] px-3 py-2 text-[#DBDEE1] hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
