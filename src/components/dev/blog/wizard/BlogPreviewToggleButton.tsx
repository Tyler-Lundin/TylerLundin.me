import React from 'react'

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
      className={`group ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-all border border-black/10 dark:border-white/15 bg-white/90 dark:bg-white/10 backdrop-blur w-9 h-9 flex items-center justify-center shadow-md hover:shadow-lg text-neutral-900 dark:text-neutral-100`}
      onClick={onToggle}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    </button>
  )
}

