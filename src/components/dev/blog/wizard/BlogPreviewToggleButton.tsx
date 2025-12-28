import React from 'react'
import { Eye } from 'lucide-react'

type BlogPreviewToggleButtonProps = {
  isOpen: boolean
  onToggle: () => void
}

export default function BlogPreviewToggleButton({ isOpen, onToggle }: BlogPreviewToggleButtonProps) {
  return (
    <button
      type="button"
      aria-label={isOpen ? 'Hide blog preview' : 'Show blog preview'}
      aria-expanded={isOpen}
      className={`group flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/80 text-neutral-500 shadow-lg backdrop-blur-md transition-all hover:bg-white focus:ring-2 focus:ring-blue-500/50 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400 dark:hover:bg-neutral-800
        ${isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'}`}
      onClick={onToggle}
    >
      <Eye className="h-5 w-5" />
    </button>
  )
}


