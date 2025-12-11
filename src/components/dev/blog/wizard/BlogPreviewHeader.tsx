import React from 'react'

type BlogPreviewHeaderProps = {
  onClose: () => void
}

export default function BlogPreviewHeader({ onClose }: BlogPreviewHeaderProps) {
  return (
    <div className="sticky top-0 z-10 px-4 py-3 border-b border-black/10 dark:border-white/15 bg-white/95 dark:bg-black/80 backdrop-blur flex items-center justify-between">
      <div className="text-sm font-semibold tracking-wide">Preview</div>
      <button
        type="button"
        className="rounded px-3 py-1.5 text-sm bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  )
}

