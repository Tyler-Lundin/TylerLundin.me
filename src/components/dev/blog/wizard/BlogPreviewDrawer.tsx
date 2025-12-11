"use client"

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { WizardState } from './types'
import BlogPreviewHeader from './BlogPreviewHeader'
import BlogPreviewContent from './BlogPreviewContent'
import BlogPreviewToggleButton from './BlogPreviewToggleButton'

export default function BlogPreviewDrawer({ state }: { state: WizardState }) {
  const [open, setOpen] = useState(false)

  const d = useMemo(() => state?.draft || {}, [state])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isOpen = open

  return (
    <div className="fixed right-0 top-0 z-[110]  pointer-events-none ">
      <div className="flex items-stretch justify-end">
        {/* Sliding panel */}
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: isOpen ? 0 : '100%', opacity: isOpen ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="pointer-events-auto "
          aria-hidden={!isOpen}
        >
          <div className="w-screen md:w-[560px] h-screen md:h-[80vh] bg-white dark:bg-black border-l border-black/10 dark:border-white/15 shadow-2xl flex flex-col">
            <BlogPreviewHeader onClose={() => setOpen(false)} />
            <BlogPreviewContent draft={d} topic={state.topic} coverImageUrl={state.cover_image_url} />
          </div>
        </motion.div>

        {/* Handle flush with right-0 (aligned similarly to StatsDrawer) */}
        <div className="pointer-events-auto mt-[25vh] absolute">
          <BlogPreviewToggleButton isOpen={isOpen} onToggle={() => setOpen((v) => !v)} />
        </div>
      </div>
    </div>
  )
}
