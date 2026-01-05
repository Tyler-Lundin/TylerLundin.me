import React from 'react'
import { X } from 'lucide-react'

type BlogPreviewHeaderProps = {
  onClose: () => void
}

export default function BlogPreviewHeader({ onClose }: BlogPreviewHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Live Preview</h3>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          Draft Mode
        </span>
      </div>
      <button
        type="button"
        className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}


