"use client"

import { cn } from '@/lib/utils'
import { BookOpenText, NotebookPen, Inbox, Briefcase } from 'lucide-react'

type DockKey = 'blog' | 'journal' | 'inbox' | 'projects' | 'settings'

export interface DevDockProps {
  active: DockKey
  onChange: (key: DockKey) => void
}

const ITEMS: { key: DockKey; label: string; Icon: any }[] = [
  { key: 'blog', label: 'Blog', Icon: BookOpenText },
  { key: 'journal', label: 'Journal', Icon: NotebookPen },
  { key: 'inbox', label: 'Inbox', Icon: Inbox },
  { key: 'projects', label: 'Projects', Icon: Briefcase },
  { key: 'settings', label: 'Settings', Icon: NotebookPen },
]

export function DevDock({ active, onChange }: DevDockProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-3 rounded-2xl bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-2xl border border-black/5 dark:border-white/10 px-3 py-2">
        {ITEMS.map(({ key, label, Icon }) => {
          const isActive = key === active
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-all',
                isActive
                  ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10'
              )}
              title={label}
            >
              <Icon className={cn('h-5 w-5 transition-transform', isActive ? 'scale-110' : 'group-hover:scale-105')} />
              <span className="text-[11px] leading-tight mt-1">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DevDock
