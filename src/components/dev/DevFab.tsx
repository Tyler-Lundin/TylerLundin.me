"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  X,
  BookOpenText,
  PlusCircle,
  Inbox,
  MessageSquare,
  Users,
  Briefcase,
  Settings,
  Receipt,
} from 'lucide-react'
import {  OrbitDotMark } from '../layout/Logo'
import { usePathname } from 'next/navigation'

type ActionItem = { label: string; Icon: any }

type ActionGroup = {
  title: string
  items: ActionItem[]
}

function getActionGroups(pathname: string): ActionGroup[] {
  // Normalize to ensure consistent checks
  const path = pathname || '/'

  // /dev root: general dev actions
  if (path === '/dev' || path === '/dev/') {
    return [
      {
        title: 'General',
        items: [
          { label: 'New Client', Icon: Users },
          { label: 'New Project', Icon: Briefcase },
          { label: 'New Blog Post', Icon: BookOpenText },
          { label: 'Open Command Center', Icon: Settings },
          { label: 'View Inbox', Icon: Inbox },
          { label: 'Invite Teammate', Icon: MessageSquare },
        ],
      },
      {
        title: 'Finance',
        items: [
          { label: 'Create Invoice', Icon: Receipt },
          { label: 'Record Payment', Icon: PlusCircle },
        ],
      },
    ]
  }

  // /dev/projects: project-centric actions
  if (path.startsWith('/dev/projects')) {
    return [
      {
        title: 'Projects',
        items: [
          { label: 'New Project', Icon: Briefcase },
          { label: 'Assign Team', Icon: Users },
          { label: 'Link Services', Icon: Settings },
          { label: 'View Inbox', Icon: Inbox },
        ],
      },
      {
        title: 'Finance',
        items: [
          { label: 'Create Invoice', Icon: Receipt },
          { label: 'Record Payment', Icon: PlusCircle },
        ],
      },
    ]
  }

  // /dev/clients: client-centric actions
  if (path.startsWith('/dev/clients')) {
    return [
      {
        title: 'Clients',
        items: [
          { label: 'New Client', Icon: Users },
          { label: 'Invite Client', Icon: MessageSquare },
          { label: 'Message Client', Icon: MessageSquare },
          { label: 'Link Projects', Icon: Briefcase },
        ],
      },
      {
        title: 'Billing',
        items: [
          { label: 'Create Invoice', Icon: Receipt },
          { label: 'Record Payment', Icon: PlusCircle },
        ],
      },
    ]
  }

  // Default: fall back to general actions
  return [
    {
      title: 'General',
      items: [
        { label: 'New Client', Icon: Users },
        { label: 'New Project', Icon: Briefcase },
        { label: 'New Blog Post', Icon: BookOpenText },
        { label: 'Open Command Center', Icon: Settings },
        { label: 'View Inbox', Icon: Inbox },
      ],
    },
  ]
}

export default function DevFab() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const pathname = usePathname()
  const ACTION_GROUPS = getActionGroups(pathname || '/')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const handleAction = (label: string) => {
    setToast(`${label} — mock action`)
    setOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 ">
      {/* Backdrop */}
      {open && (
        <button
          aria-label="Close actions"
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] cursor-default"
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'absolute bottom-16 right-0 w-[340px] max-w-[90vw] origin-bottom-right rounded-2xl border border-[#3F4147] bg-[#1E1F22] shadow-xl transition-all',
          open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#2a2b30]">
          <span className="text-sm font-medium text-white">Quick Actions</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-[#B5BAC1] hover:bg-[#2a2b30] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-2 text-[11px] text-[#949BA4]">Mock only — nothing is saved</div>
        <div className="p-3 space-y-2">
          {ACTION_GROUPS.map(({ title, items }) => (
            <div key={title}>
              <div className="px-1 pb-1 text-[10px] uppercase tracking-wide text-[#949BA4]">{title}</div>
              <div className="grid grid-cols-3 gap-2">
                {items.map(({ label, Icon }) => (
                  <button
                    key={label}
                    onClick={() => handleAction(label)}
                    className="group rounded-xl border border-transparent hover:border-[#3F4147] bg-[#232428] hover:bg-[#26272b] p-3 text-center"
                  >
                    <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-md bg-[#5865F2]/15 text-[#5865F2] group-hover:bg-[#5865F2]/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-[11px] text-[#DBDEE1] group-hover:text-white">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="absolute right-0 bottom-24 rounded-md border border-[#3F4147] bg-[#1E1F22] px-3 py-1.5 text-[12px] text-[#DBDEE1] shadow-lg">
          {toast}
        </div>
      )}

      {/* FAB */}
      <button
        aria-label="Open actions"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "transition-all rotate-0 scale-125 duration-500 backdrop-blur-lg rounded-full",
          !open && "hover:rotate-180",
          open && 'rotate-360'
        )}
      >
        <OrbitDotMark className="h-10 w-10"/>
      </button>
    </div>
  )}
