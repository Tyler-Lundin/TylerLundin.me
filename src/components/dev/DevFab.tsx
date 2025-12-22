"use client"

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  X,
  BookOpenText,
  PlusCircle,
  Inbox,
  MessageSquare,
  Users,
  Briefcase,
  Settings,
  Menu,
} from 'lucide-react'
import Image from 'next/image'

type ActionItem = {
  label: string
  href: string
  Icon: any
}

const ACTIONS: ActionItem[] = [
  { label: 'Blog', href: '/dev/blog', Icon: BookOpenText },
  { label: 'New Post', href: '/dev/blog/wizard', Icon: PlusCircle },
  { label: 'Inbox', href: '/dev/msgs', Icon: Inbox },
  { label: 'Moderation', href: '/dev/blog/moderation', Icon: MessageSquare },
  { label: 'Team', href: '/dev/team', Icon: Users },
  { label: 'Projects', href: '/dev/projects', Icon: Briefcase },
  { label: 'Settings', href: '/dev/settings', Icon: Settings },
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
        <div className="grid grid-cols-3 gap-2 p-3">
          {ACTIONS.map(({ label, href, Icon }) => (
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

      {/* FAB */}
      <button
        aria-label="Open actions"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-10 w-10 p-2 border-2 border-white  items-center justify-center rounded-full  ring-1 ring-black/10 transition-all hover:scale-105 focus:outline-none',
          open && 'rotate-90'
        )}
      >
        <Menu />
      </button>
    </div>
  )}

