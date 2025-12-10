'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import DevDock from '@/components/dev/DevDock'
import JournalModule from '@/components/dev/modules/JournalModule'
import InboxModule from '@/components/dev/modules/InboxModule'
import BlogToolsModule from '@/components/dev/modules/BlogToolsModule'
import ProjectsModule from '@/components/dev/modules/ProjectsModule'
import SettingsModule from '@/components/dev/modules/SettingsModule'

export default function DevDashboard() {
  const [active, setActive] = useState<'blog' | 'journal' | 'inbox' | 'projects' | 'settings'>('journal')
  

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-24">
      <DashboardHeader title="Dev Dashboard" />
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-xl overflow-hidden p-4 sm:p-6">
          {active === 'blog' && <BlogToolsModule />}
          {active === 'journal' && <JournalModule />}
          {active === 'inbox' && <InboxModule />}
          {active === 'projects' && <ProjectsModule />}
          {active === 'settings' && <SettingsModule />}
        </div>
      </div>

      <DevDock active={active} onChange={setActive} />
    </div>
  )
}
