"use client"

import { useState } from 'react'
import AiWriter from './AiWriter'
import PostForm, { type PostData } from './PostForm'
import PostList from './PostList'

export default function BlogDashboard() {
  const [activeTab, setActiveTab] = useState<'compose' | 'ai' | 'list'>('compose')
  const [draft, setDraft] = useState<Partial<PostData>>({})

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {(['compose', 'ai', 'list'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              'px-3 py-1.5 rounded-md text-sm ' +
              (activeTab === tab
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-black/5 dark:bg-white/10')
            }
          >
            {tab === 'compose' ? 'Compose' : tab === 'ai' ? 'AI Writer' : 'All Posts'}
          </button>
        ))}
      </div>

      {activeTab === 'ai' && (
        <AiWriter onDraft={(d) => {
          setDraft({
            title: d.title,
            excerpt: d.excerpt,
            content_md: d.content_md,
            reading_time_minutes: d.reading_time_minutes,
            tags: d.tags || [],
          })
          setActiveTab('compose')
        }} />
      )}

      {activeTab === 'compose' && (
        <PostForm
          initial={draft}
          onSaved={() => {
            setDraft({})
            setActiveTab('list')
          }}
        />
      )}

      {activeTab === 'list' && <PostList onSelect={(p) => {
        setDraft({ ...p })
        setActiveTab('compose')
      }} />}
    </div>
  )
}

