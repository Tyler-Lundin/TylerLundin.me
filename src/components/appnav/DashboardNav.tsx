"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Copy, Check, Home as HomeIcon, Users, Folder, Layers, MessageSquareText, Rocket, Newspaper, Settings, MapPin, BarChart3, Loader2, Megaphone } from 'lucide-react'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter, usePathname as useCurrentPathname } from 'next/navigation'
import UserButton from './UserButton'

function titleize(segment: string) {
  try { return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) } catch { return segment }
}

export default function DashboardNav() {
  const [open, setOpen] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const pathname = usePathname() || '/'
  const scrollRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Hide nav for full-screen flows like blog wizard
  if (pathname.startsWith('/dev/blog/wizard') || pathname.startsWith('/marketing/blog/wizard')) return null

  const parts = pathname.split('/').filter(Boolean)
  const isMarketing = parts.includes('marketing')
  const isPortal = parts.includes('portal')
  const base = isMarketing ? 'marketing' : isPortal ? 'portal' : 'dev'
  const baseHref = `/${base}`
  const trail = parts.indexOf(base) >= 0 ? parts.slice(parts.indexOf(base) + 1) : []

  const handleCopy = (e: React.MouseEvent, text: string, index: number) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-[500] flex justify-center">
      <div className="w-full max-w-5xl h-11 px-2 flex items-center justify-between gap-2 rounded-full border border-neutral-200 bg-white/90 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90">
        <div className="relative flex-1 min-w-0 h-full flex items-center">
          <div ref={scrollRef} className="flex items-center gap-0.5 overflow-x-auto no-scrollbar mask-fade-right h-full w-full " style={{ scrollbarWidth: 'none' }}>
            <Link href={baseHref} className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors">
              <HomeIcon size={14} />
            </Link>
            {trail.map((seg, i) => {
              const href = `/${[base, ...trail.slice(0, i + 1)].join('/')}`
              const isLast = i === trail.length - 1
              const title = titleize(seg)
              return (
                <div key={href} className="flex items-center gap-0.5 flex-shrink-0">
                  <span className="text-neutral-300 dark:text-neutral-700">›</span>
                  <div className="group relative flex items-center">
                    <Link href={href} className={`px-2 py-1 rounded-full text-sm transition-all whitespace-nowrap ${isLast ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}`}>{title}</Link>
                    <button onClick={(e) => handleCopy(e, seg, i)} className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-white dark:bg-neutral-800 shadow-md rounded-full border border-neutral-200 dark:border-neutral-700 transition-all z-[60] scale-75 group-hover:scale-100">
                      {copiedIndex === i ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-neutral-400" />}
                    </button>
                  </div>
                </div>
              )
            })}
            <div className="flex-shrink-0 w-12 h-px" />
          </div>
        </div>
        <div className="flex-shrink-0 pl-1 flex items-center gap-2">
          <UserButton variant="dashboard" />
          <button ref={triggerRef} onClick={() => setOpen(true)} className="flex items-center gap-2 h-8 grid place-content-center aspect-square rounded-full bg-neutral-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-lg shadow-neutral-200 dark:shadow-none">
            <Menu size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
      {open && (
        <MenuOverlay onClose={() => setOpen(false)} pathname={pathname} base={base} triggerRef={triggerRef} />
      )}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .mask-fade-right { mask-image: linear-gradient(to right, black 85%, transparent 100%); -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%); }
      `}</style>
    </div>
  )
}

function MenuOverlay({ onClose, pathname, base, triggerRef }: { onClose: () => void; pathname: string; base: 'dev' | 'marketing' | 'portal'; triggerRef: React.RefObject<HTMLButtonElement | null> }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const router = useRouter()
  const currentPath = useCurrentPathname()
  const [loadingHref, setLoadingHref] = useState<string | null>(null)

  const b = `/${base}`
  const items = useMemo(() => {
    if (base === 'portal') {
      return [
        { key: 'home', label: 'Dashboard', href: `${b}`, icon: HomeIcon, desc: 'Project overview' },
        { key: 'messages', label: 'Messages', href: `${b}/messages`, icon: MessageSquareText, desc: 'Contact support' },
        { key: 'billing', label: 'Billing', href: `${b}/billing`, icon: BarChart3, desc: 'Invoices & subscriptions' },
        { key: 'profile', label: 'Profile', href: `${b}/profile`, icon: Users, desc: 'Account settings' },
      ]
    }

    const raw = [
      { key: 'home', label: 'Dashboard', href: `${b}`, icon: HomeIcon, desc: 'Overview' },
      { key: 'analytics', label: 'Analytics', href: `${b}/analytics`, icon: BarChart3, desc: 'Signals & events' },
      { key: 'blog', label: 'Blog', href: `${b}/blog`, icon: Newspaper, desc: 'Posts & ideas' },
      { key: 'leads', label: 'Leads', href: `${b}/leads`, icon: MapPin, desc: 'Prospects & segments' },
      { key: 'swipe', label: 'Swipe', href: `${b}/leads/swipe`, icon: MapPin, desc: 'Website review filter' },
      { key: 'groups', label: 'Groups', href: `${b}/groups`, icon: Layers, desc: 'Organize prospects' },
      { key: 'messages', label: 'Messages', href: `${b}/msgs`, icon: MessageSquareText, desc: 'Inbox & outreach' },
      { key: 'ads', label: 'Ads', href: base === 'marketing' ? `${b}/ads` : `${b}/marketing/ads`, icon: Megaphone, desc: 'Manage in-house ads' },
      { key: 'team', label: 'Team', href: `${b}/team`, icon: Settings, desc: 'Invites & roles' },
      { key: 'new-project', label: 'New Project', href: `/dev/projects/new`, icon: Rocket, desc: 'Spin up a repo' },
      { key: 'projects', label: 'Projects', href: `/dev/projects`, icon: Folder, desc: 'Workspaces & artifacts' },
      { key: 'clients', label: 'Clients', href: `/dev/clients`, icon: Users, desc: 'Organizations & contacts' },
    ]
    return raw.sort((a, b) => a.label.localeCompare(b.label))
  }, [b])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault(); onClose(); triggerRef.current?.focus()
        return
      }

      const active = document.activeElement as HTMLElement
      const allLinks = Array.from(menuRef.current?.querySelectorAll('a') || [])
      const index = allLinks.indexOf(active as HTMLAnchorElement)

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = index + 1 < allLinks.length ? allLinks[index + 1] : allLinks[0]
        next?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = index - 1 >= 0 ? allLinks[index - 1] : allLinks[allLinks.length - 1]
        prev?.focus()
      } else if (e.key === 'Enter') {
        // Navigate to the currently focused link with a loading state
        const el = active as HTMLAnchorElement
        const href = el?.getAttribute?.('href')
        if (href) {
          e.preventDefault()
          setLoadingHref(href)
          // Delay slightly to allow loading UI to render
          setTimeout(() => router.push(href), 10)
        }
      } else if (e.key.length === 1 && /^[a-z0-9]$/i.test(e.key)) {
        // Quick jump
        const char = e.key.toLowerCase()
        const nextMatch = allLinks.find((link, i) => {
          // Find next item *after* current index that starts with char, or wrap around
          if (i <= index) return false
          return link.textContent?.trim().toLowerCase().startsWith(char)
        }) || allLinks.find(link => link.textContent?.trim().toLowerCase().startsWith(char))
        
        if (nextMatch) {
          e.preventDefault()
          nextMatch.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    // Focus first item on mount
    setTimeout(() => {
      const first = menuRef.current?.querySelector('a')
      if (first) (first as HTMLElement).focus()
    }, 10)
    
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, triggerRef])

  // Close the menu after navigation starts; keep it open briefly to show loading
  useEffect(() => {
    if (!loadingHref) return
    // When path changes, close the overlay after a short delay
    const t = setTimeout(() => onClose(), 250)
    return () => clearTimeout(t)
  }, [currentPath, loadingHref, onClose])

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setLoadingHref(href)
    setTimeout(() => router.push(href), 10)
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (!containerRef.current) return; if (!containerRef.current.contains(e.target as Node)) { onClose(); triggerRef.current?.focus() } }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose, triggerRef])

  return (
    <div className="fixed inset-0 z-[600] flex items-start justify-center p-4 pt-20">
      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm animate-in fade-in" />
      <div ref={containerRef} className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white/95 shadow-2xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Quick Menu</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">ESC</span>
            <button onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-500"><X size={14} /></button>
          </div>
        </div>
        <nav aria-label="Dashboard sections" className="max-h-[60vh] overflow-y-auto p-2">
          <ul ref={menuRef} role="menu" className="space-y-1">
            {items.map((it) => (
              <li key={it.key}>
                <Link href={it.href} role="menuitem" onClick={(e) => handleNavigate(e, it.href)} aria-disabled={loadingHref !== null} className={(() => {
                  const isActive = it.href === b ? pathname === b : pathname === it.href || pathname.startsWith(it.href + '/')
                  const isLoading = loadingHref === it.href
                  const baseCls = 'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-500/30 dark:focus:bg-blue-900/20 dark:focus:ring-blue-500/30 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  const activeCls = isActive ? 'bg-neutral-50 dark:bg-neutral-800' : ''
                  const loadingCls = isLoading ? 'opacity-70 pointer-events-none' : ''
                  return [baseCls, activeCls, loadingCls].filter(Boolean).join(' ')
                })()}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:bg-white group-hover:text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700 dark:group-hover:text-white transition-colors group-focus:bg-blue-100 group-focus:text-blue-600 dark:group-focus:bg-blue-900/40 dark:group-focus:text-blue-400">
                    {loadingHref === it.href ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <it.icon size={16} strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900 dark:text-white group-focus:text-blue-700 dark:group-focus:text-blue-300">{it.label}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 group-focus:text-blue-600/70 dark:group-focus:text-blue-300/70">{it.desc}</div>
                  </div>
                  {/* Right-side affordance: show spinner or Enter hint */}
                  <div className="text-[10px] font-bold uppercase px-2 transition-opacity">
                    {loadingHref === it.href ? (
                      <span className="text-blue-500">Loading…</span>
                    ) : (
                      <span className="opacity-0 group-focus:opacity-100 text-blue-400">↵</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
