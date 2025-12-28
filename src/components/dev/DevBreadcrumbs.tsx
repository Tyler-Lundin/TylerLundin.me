"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Menu, X, Copy, Check, ChevronRight, Users, Folder, Layers, MessageSquareText, Newspaper, Settings, HomeIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function titleize(segment: string) {
  try {
    return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  } catch { return segment }
}

export default function DevBreadcrumbs() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const firstItemRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  
  const parts = (pathname || '/').split('/').filter(Boolean)
  if (pathname.startsWith('/dev/blog/wizard')) return null

  const trail = parts.indexOf('dev') >= 0 ? parts.slice(parts.indexOf('dev') + 1) : []

  const handleCopy = (e: React.MouseEvent, text: string, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-[500] flex justify-center">
      <div className="w-full max-w-5xl h-11 px-2 flex items-center justify-between gap-2 rounded-full border border-neutral-200 bg-white/90 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90">
        
        {/* Scrollable Trail Area */}
        <div className="relative flex-1 min-w-0 h-full flex items-center">
          <div 
            ref={scrollRef}
            className="flex items-center gap-0.5 overflow-x-auto no-scrollbar mask-fade-right h-full w-full px-1"
            style={{ scrollbarWidth: 'none' }}
          >
            <Link 
              href="/dev" 
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
            >
              <Home size={14} />
            </Link>

            {trail.map((seg, i) => {
              const href = `/${['dev', ...trail.slice(0, i + 1)].join('/')}`
              const isLast = i === trail.length - 1
              const title = titleize(seg)

              return (
                <div key={href} className="flex items-center gap-0.5 flex-shrink-0">
                  <ChevronRight size={12} className="text-neutral-300 dark:text-neutral-700 flex-shrink-0" />
                  
                  <div className="group relative flex items-center">
                    <Link 
                      href={href} 
                      className={`px-2 py-1 rounded-full text-sm transition-all whitespace-nowrap ${
                        isLast 
                          ? 'font-bold text-neutral-900 dark:text-white' 
                          : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {title}
                    </Link>

                    {/* Copy Button: Absolute + Higher Z-Index than Mask */}
                    <button
                      onClick={(e) => handleCopy(e, seg, i)}
                      className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-white dark:bg-neutral-800 shadow-md rounded-full border border-neutral-200 dark:border-neutral-700 transition-all z-[60] scale-75 group-hover:scale-100"
                    >
                      {copiedIndex === i ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-neutral-400" />}
                    </button>
                  </div>
                </div>
              )
            })}
            
            {/* The Safe Zone: ensures the last item isn't partially hidden by the fade mask */}
            <div className="flex-shrink-0 w-12 h-px" />
          </div>
        </div>

        {/* Action: Pill Menu */}
        <div className="flex-shrink-0 pl-1">
          <button
            ref={triggerRef}
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 h-8 px-4 rounded-full bg-neutral-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-lg shadow-neutral-200 dark:shadow-none"
          >
            Menu
            <Menu size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Menu Overlay */}
      {open && (
        <MenuOverlay
          onClose={() => setOpen(false)}
          query={query}
          setQuery={setQuery}
          pathname={pathname}
          firstItemRef={firstItemRef as unknown as React.RefObject<HTMLButtonElement>}
          triggerRef={triggerRef as unknown as React.RefObject<HTMLButtonElement>}
        />
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .mask-fade-right {
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
      `}</style>
    </div>
  )
}

function MenuOverlay({ onClose, query, setQuery, pathname, firstItemRef, triggerRef }: {
  onClose: () => void
  query: string
  setQuery: (s: string) => void
  pathname: string
  firstItemRef: React.RefObject<HTMLButtonElement>
  triggerRef: React.RefObject<HTMLButtonElement>
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    // focus first actionable item
    setTimeout(() => firstItemRef.current?.focus(), 0)
    return () => document.removeEventListener('keydown', onKey)
  }, [firstItemRef, onClose, triggerRef])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        onClose()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose, triggerRef])

  const items = [
    { key: 'home', label: 'Dashboard', href: '/dev', icon: HomeIcon, desc: 'Command center' },
    { key: 'clients', label: 'Clients', href: '/dev/clients', icon: Users, desc: 'Organizations & contacts' },
    { key: 'projects', label: 'Projects', href: '/dev/projects', icon: Folder, desc: 'Workspaces & artifacts' },
    { key: 'services', label: 'Services', href: '/dev/services', icon: Layers, desc: 'Catalog & bundles' },
    { key: 'messages', label: 'Messages', href: '/dev/msgs', icon: MessageSquareText, desc: 'Inbox & quotes' },
    { key: 'blog', label: 'Blog', href: '/dev/blog', icon: Newspaper, desc: 'Posts & views' },
    { key: 'team', label: 'Team', href: '/dev/team', icon: Settings, desc: 'Invites & roles' },
  ] as const

  const q = query.trim().toLowerCase()
  const filtered = q ? items.filter(i => `${i.label} ${i.desc}`.toLowerCase().includes(q)) : items

  return (
    <div className="fixed inset-0 z-[600] flex items-start justify-center p-4 pt-20">
      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm animate-in fade-in" />
      <div ref={containerRef} className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white/95 shadow-2xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quick search…"
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
          />
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <nav aria-label="Dev sections" className="max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-500">No matches.</div>
          ) : (
            <ul role="menu" className="p-2">
              {filtered.map((it, idx) => (
                <li key={it.key}>
                  <Link
                    href={it.href}
                    role="menuitem"
                    onClick={onClose}
                    className={(() => {
                      const isActive = it.href === '/dev'
                        ? pathname === '/dev'
                        : pathname === it.href || pathname.startsWith(it.href + '/')
                      return `group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${isActive ? 'bg-neutral-50 dark:bg-neutral-800' : ''}`
                    })()}
                  >
                    <it.icon className="h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-300" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">{it.label}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{it.desc}</div>
                    </div>
                    <ChevronRight size={14} className="text-neutral-300 dark:text-neutral-700" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200 text-[10px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <div>Esc to close • Enter to open</div>
          <div className="hidden sm:flex items-center gap-2">
            <kbd className="rounded border border-neutral-300 bg-white px-1 py-0.5 text-[10px] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">/</kbd>
            <span>to search</span>
          </div>
        </div>
      </div>
    </div>
  )
}
