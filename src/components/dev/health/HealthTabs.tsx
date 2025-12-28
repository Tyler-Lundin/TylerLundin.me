"use client"

import React from 'react'
import HealthRunner from './HealthRunner'
import HealthHistory from './HealthHistory'

export default function HealthTabs({ projectId, settings, viewAllHref }: { projectId: string; settings: React.ReactNode; viewAllHref?: string }) {
  const [tab, setTab] = React.useState<'live' | 'history'>('live')
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button onClick={() => setTab('live')} className={`px-3 py-1.5 rounded-md text-xs font-medium border ${tab === 'live' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'} border-neutral-200 dark:border-neutral-800`}>Live</button>
        <button onClick={() => setTab('history')} className={`px-3 py-1.5 rounded-md text-xs font-medium border ${tab === 'history' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'} border-neutral-200 dark:border-neutral-800`}>History</button>
      </div>
      {tab === 'live' ? (
        <HealthRunner projectId={projectId} initialItems={[]} actions={settings} autoRun />
      ) : (
        <HealthHistory projectId={projectId} viewAllHref={viewAllHref} />
      )}
    </div>
  )
}
