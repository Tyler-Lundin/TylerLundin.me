"use client"

import { useState } from 'react'
import Link from 'next/link'
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
  Home,
  LayoutDashboard,
} from 'lucide-react'
import {  OrbitDotMark } from '../layout/Logo'

type ActionItem = {
  label: string
  href: string
  Icon: any
}

type ActionGroup = {
  title: string
  items: ActionItem[]
}

const ACTION_GROUPS: ActionGroup[] = [
  {
    title: 'CRM',
    items: [
      { label: 'CRM', href: '/dev/crm', Icon: LayoutDashboard },
      { label: 'CRM Clients', href: '/dev/crm/clients', Icon: Users },
      { label: 'CRM Projects', href: '/dev/crm/projects', Icon: Briefcase },
      { label: 'CRM Invites', href: '/dev/crm/invitations', Icon: MessageSquare },
    ],
  },
  {
    title: 'Blog',
    items: [
      { label: 'Blog', href: '/dev/blog', Icon: BookOpenText },
      { label: 'New Post', href: '/dev/blog/wizard', Icon: PlusCircle },
      { label: 'Moderation', href: '/dev/blog/moderation', Icon: MessageSquare },
    ],
  },
  {
    title: 'Team',
    items: [
      { label: 'Team', href: '/dev/team', Icon: Users },
      { label: 'Inbox', href: '/dev/msgs', Icon: Inbox },
    ],
  },
  {
    title: 'General',
    items: [
      { label: 'Services', href: '/dev/services', Icon: Briefcase },
      { label: 'Projects', href: '/dev/projects', Icon: Briefcase },
      { label: 'Settings', href: '/dev/settings', Icon: Settings },
      { label: 'Home', href: '/', Icon: Home },
    ],
  },
]

export default function DevFab() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
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
        <div className="p-3 space-y-2">
          {ACTION_GROUPS.map(({ title, items }) => (
            <div key={title}>
              <div className="px-1 pb-1 text-[10px] uppercase tracking-wide text-[#949BA4]">{title}</div>
              <div className="grid grid-cols-3 gap-2">
                {items.map(({ label, href, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="group rounded-xl border border-transparent hover:border-[#3F4147] bg-[#232428] hover:bg-[#26272b] p-3 text-center"
                  >
                    <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-md bg-[#5865F2]/15 text-[#5865F2] group-hover:bg-[#5865F2]/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-[11px] text-[#DBDEE1] group-hover:text-white">{label}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        aria-label="Open actions"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "transition-all rotate-0 scale-125 duration-500",
          !open && "hover:rotate-180",
          open && 'rotate-360'
        )}
      >
        <OrbitDotMark />
      </button>
    </div>
  )}
