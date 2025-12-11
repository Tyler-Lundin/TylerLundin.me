import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { WizardState } from './types'

type BlogPreviewContentProps = {
  draft: WizardState['draft']
  topic: string
  coverImageUrl?: string
}

export default function BlogPreviewContent({ draft, topic, coverImageUrl }: BlogPreviewContentProps) {
  const title = draft.title || topic || 'Untitled'
  return (
    <div className="min-h-0 flex-1 overflow-auto p-4">
      <div className="space-y-3">
        {!!coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImageUrl} alt="cover" className="rounded-md w-full object-cover aspect-[16/9]" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {!!draft.excerpt && <p className="text-sm opacity-80 mt-1">{draft.excerpt}</p>}
        </div>
        <div className="prose prose-lg dark:prose-invert mt-2 bg-white/70 dark:bg-neutral-900/70 p-5 rounded-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {draft.content_md || ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

