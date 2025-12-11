"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { WizardState } from './types'
import Step1Topic from './Step1Topic'
import Step2Chat from './Step2Chat'
import Step3Overview from './Step3Overview'
import Step4CoverUpload from './Step4CoverUpload'
import Step5Finalize from './Step5Finalize'
import { ActivityProvider, useActivity } from './activity/ActivityContext'
import ActivityBar from './activity/ActivityBar'
import BlogPreviewDrawer from './BlogPreviewDrawer'

function nowIso() {
  return new Date().toISOString()
}

function BlogWizardInner() {
  const [state, setStateFull] = useState<WizardState>({
    step: 1,
    mode: 'express',
    topic: '',
    goals: '',
    audience: '',
    keywords: [],
    suggestions: [],
    messages: [],
    draft: {},
    cover_image_url: undefined,
  })

  const setState = (patch: Partial<WizardState>) => setStateFull((s) => ({ ...s, ...patch }))
  const step = state.step

  const canNext = useMemo(() => {
    if (step === 1) return !!(state.goals && state.goals.trim())
    if (step === 3) return !!state.draft?.title && !!state.draft?.content_md
    if (step === 4) return true
    return true
  }, [step, state])

  const { start, complete, fail } = useActivity()

  const generate = async () => {
    const actId = start('Generating draft…')
    const points = (state.messages || [])
      .filter((m) => m.role === 'assistant')
      .slice(-3)
      .map((m) => m.content)
    const res = await fetch('/api/dev/blog/ai-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: state.topic,
        brief: state.goals,
        tone: 'opinionated, practical, concise',
        points,
        anchors: state.keywords,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      fail(actId, json?.error || 'Failed to generate')
      throw new Error(json?.error || 'Failed to generate')
    }
    setState({ draft: json.draft, step: 3 })
    complete(actId, 'Draft ready')
  }

  const finish = async (status: 'draft' | 'published') => {
    const body = {
      title: state.draft.title,
      excerpt: state.draft.excerpt,
      content_md: state.draft.content_md,
      cover_image_url: state.cover_image_url,
      status,
      tags: state.draft.tags || [],
      published_at: status === 'published' ? nowIso() : null,
      reading_time_minutes: state.draft.reading_time_minutes,
    }
    const res = await fetch('/api/dev/blog/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || 'Failed to save')
    setState({ step: 1, draft: {}, cover_image_url: undefined, topic: '', messages: [] })
  }

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      <BlogPreviewDrawer state={state} />
      <div className="sticky top-0 z-20 bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur border-b border-black/5 dark:border-white/10 px-5 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-wide uppercase">Blog Post Wizard</div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={'rounded-full px-3 py-1 ' + (n === step ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-black/5 dark:bg-white/10')}>
                  Step {n}
                </div>
              ))}
            </div>
            <ActivityBar />
            <div className="sm:hidden text-xs opacity-80">Step {step} of 5</div>
            <Link href="/dev" className="text-xs px-3 py-1.5 rounded bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20">
              Cancel
            </Link>
          </div>
        </div>
        <div className="sm:hidden mt-2 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-black dark:bg-white transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-5 sm:px-6 py-6 space-y-8 pb-32 sm:pb-8">
        {step === 1 && <Step1Topic state={state} setState={setState} />}
        {step === 2 && <Step2Chat state={state} setState={setState} onGenerate={generate} />}
        {step === 3 && <Step3Overview state={state} setState={setState} />}
        {step === 4 && <Step4CoverUpload state={state} setState={setState} />}
        {step === 5 && <Step5Finalize state={state} />}

        <div className="hidden sm:flex items-center justify-between pt-2">
          <div className="text-xs opacity-70">Topic: {state.topic || '—'}</div>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={() => setState({ step: step - 1 })} className="px-3 py-2 rounded bg-black/10 dark:bg-white/10">Back</button>
            )}
            {step < 5 && (
              <button onClick={() => setState({ step: step + 1 })} disabled={!canNext} className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black">
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 dark:border-white/10 bg-neutral-100/95 dark:bg-neutral-900/95 backdrop-blur px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+14px)]">
        <div className="flex items-center gap-3">
          <Link href="/dev/blog" className="shrink-0 px-2 py-3 text-sm text-neutral-700 dark:text-neutral-300">
            Cancel
          </Link>
          {step > 1 ? (
            <button
              onClick={() => setState({ step: step - 1 })}
              className="flex-1 px-4 py-3 rounded bg-black/10 dark:bg-white/10"
            >
              Back
            </button>
          ) : (
            <div className="flex-1" />
          )}
          {step < 5 && (
            <button
              onClick={() => setState({ step: step + 1 })}
              disabled={!canNext}
              className="flex-1 px-4 py-3 rounded bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed dark:bg-white dark:text-black"
            >
              Next
            </button>
          )}
        </div>
        <div className="text-[11px] opacity-70 mt-2 truncate">Topic: {state.topic || '—'}</div>
      </div>
    </div>
  )
}

export default function BlogWizard() {
  return (
    <ActivityProvider>
      <BlogWizardInner />
    </ActivityProvider>
  )
}
