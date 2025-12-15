"use client"

import { cn } from '@/lib/utils'
import { BookOpenText, NotebookPen, Inbox, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type DockItem = { key: 'blog' | 'journal' | 'inbox' | 'projects' | 'settings'; label: string; Icon: any; href: string }

const ITEMS: DockItem[] = [
  { key: 'blog', label: 'Blog', Icon: BookOpenText, href: '/dev/blog' },
  { key: 'journal', label: 'Journal', Icon: NotebookPen, href: '/dev/journal' },
  { key: 'inbox', label: 'Inbox', Icon: Inbox, href: '/dev/msgs' },
  { key: 'projects', label: 'Projects', Icon: Briefcase, href: '/dev/projects' },
  { key: 'settings', label: 'Settings', Icon: NotebookPen, href: '/dev/settings' },
]

export default function DevDock() {
  const pathname = usePathname() || '/dev'
  return (
    <div className="fixed bottom-[env(safe-area-inset-bottom,16px)] left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-2 rounded-t-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-lg ring-1 ring-black/10 dark:ring-white/10 px-2.5 py-2">
        {ITEMS.map(({ key, label, Icon, href }) => {
          const isRoot = href === '/dev'
          const isActive = isRoot ? pathname === '/dev' : pathname.startsWith(href)
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                'group relative flex flex-col items-center hover:scale-125 justify-center rounded-xl px-3 py-2 transition-all',
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10'
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
