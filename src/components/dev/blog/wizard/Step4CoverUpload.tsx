"use client"

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WizardState } from './types'
import { useActivity } from './activity/ActivityContext'

function uid() {
  return Math.random().toString(36).slice(2)
}

export default function Step4CoverUpload({ state, setState }: { state: WizardState; setState: (s: Partial<WizardState>) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { start, complete, fail } = useActivity()

  const onUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    const actId = start('Uploading cover image…')
    try {
      const supabase = createClient()
      const path = `blog-covers/${Date.now()}-${uid()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('public').upload(path, file, { upsert: false })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('public').getPublicUrl(path)
      setState({ cover_image_url: data.publicUrl })
      complete(actId, 'Cover uploaded')
    } catch (e: any) {
      fail(actId, e?.message || 'Upload failed')
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="rounded-lg border border-dashed border-black/20 dark:border-white/20 p-6 text-center bg-white/60 dark:bg-neutral-900/60">
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onUpload(f)
          }} />
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-3 rounded bg-black text-white dark:bg-white dark:text-black"
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Choose Cover Image'}
          </button>
          {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-neutral-900/60">
          <div className="text-xs uppercase opacity-70 mb-2">Preview</div>
          {state.cover_image_url ? (
            <img src={state.cover_image_url} alt="cover" className="rounded-md w-full object-cover aspect-[16/9]" />
          ) : (
            <div className="text-sm opacity-60">No image selected.</div>
          )}
        </div>
      </div>
    </div>
  )
}
