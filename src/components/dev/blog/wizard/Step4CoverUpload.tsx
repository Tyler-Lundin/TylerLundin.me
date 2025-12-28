"use client"

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WizardState } from './types'
import { useActivity } from './activity/ActivityContext'
import { UploadCloud, Image as ImageIcon } from 'lucide-react'

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
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Upload Cover Image</h2>
          <p className="mt-1 text-sm text-neutral-500">
            A great cover image makes your post stand out. Recommended aspect ratio is 16:9.
          </p>
        </div>
        
        <div className="border-t border-neutral-200 p-6 dark:border-neutral-800">
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-12 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
            {state.cover_image_url ? (
              <div className="space-y-4">
                <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-lg shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={state.cover_image_url} alt="Cover preview" className="aspect-[16/9] w-full object-cover" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
                </div>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="mx-auto flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Choose a Different Image'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Drag and drop or click to upload</h3>
                <p className="text-xs text-neutral-500">PNG, JPG, WEBP up to 5MB</p>
                <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onUpload(f)
                }} />
                <button
                  onClick={() => inputRef.current?.click()}
                  className="mx-auto flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  disabled={uploading}
                >
                  <UploadCloud className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Choose Image'}
                </button>
              </div>
            )}
            {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
