"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
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
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

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

  // Autosave draft (debounced)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Keep a fresh ref of state for immediate saves
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // Immediate save helper (also used by debounce)
  const saveDraftNow = async (override?: WizardState) => {
    const s = override || stateRef.current
    const hasContent = Boolean(
      (s.topic && s.topic.trim()) ||
      (s.goals && s.goals.trim()) ||
      (s.draft?.title && s.draft.title.trim()) ||
      (s.draft?.content_md && s.draft.content_md.trim()) ||
      s.cover_image_url
    )
    if (!hasContent) return
    setSaveError(null)
    const payload: any = {
      id: s.draft?.id,
      title: s.draft?.title || s.topic || 'Untitled',
      excerpt: s.draft?.excerpt || '',
      content_md: s.draft?.content_md || '',
      cover_image_url: s.cover_image_url || null,
      status: 'draft',
      tags: s.draft?.tags || [],
      reading_time_minutes: s.draft?.reading_time_minutes,
      meta: { wizard_state: { ...s, draft: { ...s.draft } } },
    }
    const res = await fetch('/api/dev/blog/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || 'Failed to save draft')
    if (json?.post?.id && json.post.id !== s.draft?.id) {
      setState({ draft: { ...s.draft, id: json.post.id } })
    }
    setLastSavedAt(new Date().toISOString())
  }

  useEffect(() => {
    const hasContent = Boolean(
      (state.topic && state.topic.trim()) ||
      (state.goals && state.goals.trim()) ||
      (state.draft?.title && state.draft.title.trim()) ||
      (state.draft?.content_md && state.draft.content_md.trim()) ||
      state.cover_image_url
    )
    if (!hasContent) return

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { void saveDraftNow() }, 800)

    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.topic, state.goals, state.keywords, state.messages, state.edit_messages, state.draft?.title, state.draft?.excerpt, state.draft?.content_md, state.draft?.tags, state.cover_image_url])

  // Load and prompt to resume existing drafts
  const [showDraftPicker, setShowDraftPicker] = useState(false)
  const [drafts, setDrafts] = useState<any[]>([])
  useEffect(() => {
    let mounted = true
    const loadDrafts = async () => {
      try {
        const res = await fetch('/api/dev/blog/posts?status=draft&limit=20')
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load drafts')
        const rows = Array.isArray(json.posts) ? json.posts : []
        if (mounted && rows.length > 0) {
          setDrafts(rows)
          setShowDraftPicker(true)
        }
      } catch {
        // ignore
      }
    }
    loadDrafts()
    return () => { mounted = false }
  }, [])

  const resumeFromDraft = (post: any) => {
    const w = post?.meta?.wizard_state
    if (w && typeof w === 'object') {
      setStateFull({ ...w, draft: { ...(w.draft || {}), id: post.id }, cover_image_url: w.cover_image_url || post.cover_image_url })
    } else {
      setState({
        step: 3,
        topic: post.title || state.topic,
        draft: {
          id: post.id,
          title: post.title || state.draft?.title,
          excerpt: post.excerpt || state.draft?.excerpt,
          content_md: post.content_md || state.draft?.content_md,
          tags: state.draft?.tags || [],
          reading_time_minutes: post.reading_time_minutes || state.draft?.reading_time_minutes,
        },
        cover_image_url: post.cover_image_url || state.cover_image_url,
      })
    }
    setShowDraftPicker(false)
  }

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
    // Flush save immediately to avoid debounce loss
    try { await saveDraftNow({ ...stateRef.current, draft: json.draft, step: 3 }) } catch {}
    complete(actId, 'Draft ready')
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
      <BlogPreviewDrawer state={state} />
      
      {/* Wizard Header */}
      <div className="fixed top-0 left-0 right-0 h-16 z-[1000] border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dev/blog" className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white">
              <X className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-neutral-900 dark:text-white">New Blog Post</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>Step {step} of 5</span>
                <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                <span className="truncate max-w-[200px]">{state.topic || 'Untitled'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ActivityBar />
            <div className="hidden h-6 w-px bg-neutral-200 dark:bg-neutral-800 sm:block" />
            <div className="flex items-center gap-2">
              <button 
                onClick={async () => { try { await saveDraftNow() } catch {} ; setState({ step: Math.max(1, step - 1) }) }}
                disabled={step === 1}
                className="hidden rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 sm:block dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                Back
              </button>
              <button 
                onClick={async () => { try { await saveDraftNow() } catch {} ; setState({ step: Math.min(5, step + 1) }) }}
                disabled={step === 5 || !canNext}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {step === 5 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-100 dark:bg-neutral-800">
          <div 
            className="h-full bg-neutral-900 transition-all duration-300 dark:bg-white"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {showDraftPicker && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDraftPicker(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between px-2 py-2">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-neutral-400">Resume Draft</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-300">Pick a draft to continue, newest first</div>
              </div>
              <button onClick={() => setShowDraftPicker(false)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
              {drafts.map((p) => (
                <button key={p.id} onClick={() => resumeFromDraft(p)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-neutral-900 dark:text-white">{p.title || 'Untitled'}</div>
                    <div className="truncate text-xs text-neutral-500">{p.excerpt || ''}</div>
                  </div>
                  <div className="shrink-0 text-xs text-neutral-400">{p.updated_at ? new Date(p.updated_at).toLocaleString() : ''}</div>
                </button>
              ))}
              {drafts.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-neutral-500">No drafts found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-32">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step === 1 && <Step1Topic state={state} setState={setState} />}
          {step === 2 && <Step2Chat state={state} setState={setState} onGenerate={generate} />}
          {step === 3 && <Step3Overview state={state} setState={setState} />}
          {step === 4 && <Step4CoverUpload state={state} setState={setState} />}
          {step === 5 && <Step5Finalize state={state} />}
        </div>
      </div>

      {/* Mobile Footer Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-neutral-200 bg-white/90 p-4 backdrop-blur-lg sm:hidden dark:border-neutral-800 dark:bg-neutral-900/90">
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={async () => { try { await saveDraftNow() } catch {} ; setState({ step: Math.max(1, step - 1) }) }}
            disabled={step === 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-400"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-xs font-medium text-neutral-500">Step {step} / 5</div>
          <button 
            onClick={async () => { try { await saveDraftNow() } catch {} ; setState({ step: Math.min(5, step + 1) }) }}
            disabled={step === 5 || !canNext}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
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
