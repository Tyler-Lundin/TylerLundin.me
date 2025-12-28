"use client"

import React, { useMemo } from 'react'
import { useActivity } from './ActivityContext'

function Spinner({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin ${className}`} />
  )
}

export default function ActivityBar() {
  const { activities, clearFinished } = useActivity()
  const pending = activities.filter((a) => a.status === 'pending')
  const latest = useMemo(() => activities[0], [activities])

  if (!activities.length) return null

  const tones: Record<string, { base: string, icon: string }> = {
    pending: { base: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-500/20', icon: '' },
    success: { base: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/20', icon: 'bg-emerald-500' },
    error: { base: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-500/20', icon: 'bg-rose-500' },
  }
  
  const tone = tones[latest.status] || tones.pending

  return (
    <div className={`ml-3 inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full border ${tone.base}`}>
      {latest.status === 'pending' ? <Spinner /> : (
        <span className={`inline-block h-2 w-2 rounded-full ${tone.icon}`} />
      )}
      <span className="truncate max-w-[30ch]">{latest.label}{pending.length > 1 ? ` (+${pending.length - 1})` : ''}</span>
      
      {pending.length === 0 && (
        <button
          className="ml-1 opacity-70 hover:opacity-100 underline decoration-dotted"
          onClick={clearFinished}
          title="Clear finished"
        >
          clear
        </button>
      )}
    </div>
  )
}

