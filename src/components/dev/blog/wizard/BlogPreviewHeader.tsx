import React from 'react'
import { X } from 'lucide-react'

type BlogPreviewHeaderProps = {
  onClose: () => void
}

export default function BlogPreviewHeader({ onClose }: BlogPreviewHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Live Preview</h3>
      <button
        type="button"
        className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}


