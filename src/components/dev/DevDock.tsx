"use client"

import { cn } from '@/lib/utils'
import { BookOpenText, NotebookPen, Inbox, Briefcase, MapPin, Hand } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type DockItem = { key: 'blog' | 'journal' | 'inbox' | 'projects' | 'leads' | 'swipe' | 'settings'; label: string; Icon: any; href: string }

const ITEMS: DockItem[] = [
  { key: 'blog', label: 'Blog', Icon: BookOpenText, href: '/dev/blog' },
  { key: 'journal', label: 'Journal', Icon: NotebookPen, href: '/dev/journal' },
  { key: 'inbox', label: 'Inbox', Icon: Inbox, href: '/dev/msgs' },
  { key: 'projects', label: 'Projects', Icon: Briefcase, href: '/dev/projects' },
  { key: 'leads', label: 'Leads', Icon: MapPin, href: '/dev/leads' },
  { key: 'swipe', label: 'Swipe', Icon: Hand, href: '/dev/leads/swipe' },
  { key: 'settings', label: 'Settings', Icon: NotebookPen, href: '/dev/settings' },
]

export default function DevDock() {
  const pathname = usePathname() || '/dev'
  return (
    <div className="fixed bottom-[env(safe-area-inset-bottom,16px)] left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-2 rounded-t-2xl bg-[#1E1F22] shadow-lg ring-1 ring-[#3F4147] px-2.5 py-2">
        {ITEMS.map(({ key, label, Icon, href }) => {
          const isRoot = href === '/dev'
          const isActive = isRoot ? pathname === '/dev' : pathname.startsWith(href)
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                'group relative flex flex-col items-center hover:scale-110 justify-center rounded-xl px-3 py-2 transition-all',
                isActive
                  ? 'bg-[#5865F2] text-white shadow-sm'
                  : 'text-[#B5BAC1] hover:bg-[#383A40]'
              )}
              title={label}
            >
              <Icon className={cn('h-5 w-5 transition-transform', isActive ? 'scale-105' : 'group-hover:scale-105')} />
              <span className="text-[11px] leading-tight mt-1">{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
