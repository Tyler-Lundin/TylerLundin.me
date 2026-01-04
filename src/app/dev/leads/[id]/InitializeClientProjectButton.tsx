"use client"
import { useState } from 'react'
import Link from 'next/link'

export default function InitializeClientProjectButton({
  leadId,
  disabled: initiallyDisabled = false,
  existingClientId,
  existingProjectSlug,
}: {
  leadId: string
  disabled?: boolean
  existingClientId?: string | null
  existingProjectSlug?: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    client_id: string
    project_id?: string | null
    project_slug?: string | null
    created?: { client?: boolean; project?: boolean }
  } | null>(null)

  async function handleClick() {
    try {
      setLoading(true)
      setError(null)
      setResult(null)
      const res = await fetch('/api/dev/leads/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      })
      const data = await res.json()
      if (!res.ok || data?.error) throw new Error(data?.error || 'Failed to initialize')
      setResult({ client_id: data.client_id, project_id: data.project_id, project_slug: data.project_slug, created: data.created })
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading || initiallyDisabled || !!result}
        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading
          ? 'Initializing…'
          : initiallyDisabled || result
            ? 'Initialized'
            : 'Initialize Client + Project'}
      </button>

      {error && (
        <div className="text-xs text-red-600">{error}</div>
      )}

      {(initiallyDisabled || result) && (
        <div className="text-xs text-neutral-600 dark:text-neutral-300">
          {initiallyDisabled && !result ? 'Already linked. ' : 'Created/linked. '}
          <Link href={`/dev/clients/${result?.client_id || existingClientId}`} className="text-blue-600 underline ml-1">Open Client</Link>
          {(result?.project_slug || existingProjectSlug) && (
            <>
              <span className="mx-1 text-neutral-400">•</span>
              <Link href={`/dev/projects/${result?.project_slug || existingProjectSlug}`} className="text-blue-600 underline">Open Project</Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
