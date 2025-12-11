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

  const tone = latest.status === 'pending' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-600/20'
    : latest.status === 'success' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-600/20'
    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-600/20'

  return (
    <div className={`ml-3 inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full border ${tone}`}>
      {latest.status === 'pending' ? <Spinner /> : (
        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: latest.status === 'success' ? '#10b981' : '#f43f5e' }} />
      )}
      <span className="truncate max-w-[30ch]">{latest.label}{pending.length > 1 ? ` (+${pending.length - 1})` : ''}</span>
      {/* Dismiss finished */}
      <button
        className="ml-1 opacity-70 hover:opacity-100 underline decoration-dotted"
        onClick={clearFinished}
        title="Clear finished"
      >
        clear
      </button>
    </div>
  )
}

