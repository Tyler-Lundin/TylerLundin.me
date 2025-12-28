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
    <>
      {/* Toggle Button */}
      <div className="fixed right-4 top-[88px] z-50">
         <BlogPreviewToggleButton isOpen={isOpen} onToggle={() => setOpen((v) => !v)} />
      </div>

      {/* Drawer */}
      <div className={`fixed inset-0 z-40 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-neutral-900/20 dark:bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          onClick={() => setOpen(false)}
        />
        
        {/* Sliding panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: isOpen ? 0 : '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 h-full w-full"
        >
          <div className="flex h-full w-screen flex-col border-l border-neutral-200 bg-white shadow-2xl md:w-[560px] dark:border-neutral-800 dark:bg-neutral-900">
            <BlogPreviewHeader onClose={() => setOpen(false)} />
            <BlogPreviewContent draft={d} topic={state.topic} coverImageUrl={state.cover_image_url} />
          </div>
        </motion.div>
      </div>
    </>
  )
}


