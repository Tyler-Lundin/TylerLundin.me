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
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
      <div className="space-y-6">
        {!!coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImageUrl} alt="cover" className="w-full rounded-lg object-cover aspect-[16/9] shadow-md" />
        )}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{title}</h1>
          {!!draft.excerpt && <p className="text-lg text-neutral-500">{draft.excerpt}</p>}
        </div>
        <article className="prose prose-neutral max-w-none pt-4 dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {draft.content_md || ''}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}


