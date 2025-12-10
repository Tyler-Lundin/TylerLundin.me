"use client"

import { useMemo, useState } from 'react'
import type { WizardState } from './types'
import Step1Topic from './Step1Topic'
import Step2Chat from './Step2Chat'
import Step3Overview from './Step3Overview'
import Step4CoverUpload from './Step4CoverUpload'
import Step5Finalize from './Step5Finalize'

function nowIso() {
  return new Date().toISOString()
}

export default function BlogWizard() {
  const [state, setStateFull] = useState<WizardState>({
    step: 1,
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
    if (step === 1) return !!state.topic
    if (step === 3) return !!state.draft?.title && !!state.draft?.content_md
    if (step === 4) return true
    return true
  }, [step, state])

  const generate = async () => {
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
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || 'Failed to generate')
    setState({ draft: json.draft, step: 3 })
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
    <div className="min-h-[calc(100vh-6rem)] -mx-4 sm:mx-0">
      <div className="sticky top-0 z-20 bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur border-b border-black/5 dark:border-white/10 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-wide uppercase">Blog Post Wizard</div>
          <div className="flex items-center gap-2 text-xs">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className={'rounded-full px-3 py-1 ' + (n === step ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-black/5 dark:bg-white/10')}>
                Step {n}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {step === 1 && <Step1Topic state={state} setState={setState} />}
        {step === 2 && <Step2Chat state={state} setState={setState} onGenerate={generate} />}
        {step === 3 && <Step3Overview state={state} setState={setState} />}
        {step === 4 && <Step4CoverUpload state={state} setState={setState} />}
        {step === 5 && <Step5Finalize state={state} />}

        <div className="flex items-center justify-between pt-2">
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
    </div>
  )
}
