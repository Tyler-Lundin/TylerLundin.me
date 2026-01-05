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
      className={`group flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 p-2.5 text-neutral-600 shadow-xl backdrop-blur-md transition-all hover:bg-white hover:pr-4 hover:text-neutral-900 focus:ring-2 focus:ring-black/10 dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white
        ${isOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'opacity-100 translate-x-0'}`}
      onClick={onToggle}
    >
      <Eye className="h-5 w-5" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 group-hover:max-w-[100px]">
        Preview
      </span>
    </button>
  )
}


