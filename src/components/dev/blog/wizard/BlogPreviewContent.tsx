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
  const title = draft.title || topic || 'Untitled Draft'
  const date = new Date().toLocaleDateString()

  // Use the same gradient background as the public post, but inside this container
  return (
    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto bg-neutral-50/50 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl p-6 md:p-8">
        <article className="rounded-2xl border border-black/5 bg-gradient-to-b from-white to-neutral-50 p-6 shadow-sm dark:border-white/10 dark:from-neutral-900 dark:to-neutral-950 dark:shadow-none sm:p-8">
          {/* Header */}
          <header className="mb-8 space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              {title}
            </h1>
            
            {!!draft.excerpt && (
              <p className="text-lg text-neutral-600 dark:text-neutral-300">
                {draft.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span>{date}</span>
              <span className="opacity-60">•</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                #preview
              </span>
              {draft.tags?.map((t: string) => (
                <span key={t} className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
                  #{t}
                </span>
              ))}
            </div>
          </header>

          {/* Cover Image */}
          {coverImageUrl ? (
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={coverImageUrl} 
                alt="cover" 
                className="blog-pan-vert h-full w-full object-cover" 
              />
            </div>
          ) : (
            <div className="mb-8 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="text-sm text-neutral-400">No cover image selected</span>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-neutral prose-lg max-w-none dark:prose-invert">
            {draft.content_md ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {draft.content_md}
              </ReactMarkdown>
            ) : (
              <div className="space-y-4 opacity-50">
                <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-32 w-full rounded bg-neutral-100 dark:bg-neutral-900" />
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}