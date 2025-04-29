'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface JournalFormProps {
  onEntrySubmitted: () => void
}

export default function JournalForm({ onEntrySubmitted }: JournalFormProps) {
  const [entryText, setEntryText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!userId) {
      setError('You must be logged in to submit a journal entry')
      setIsSubmitting(false)
      return
    }

    try {
      // First, get the summarized text
      const response = await fetch('/api/summarize-journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: entryText }),
      })

      if (!response.ok) {
        throw new Error('Failed to summarize journal entry')
      }

      const { summary } = await response.json()

      // Then save to Supabase
      const { error: dbError } = await supabase
        .from('journal_entries')
        .insert({
          entry_text: entryText,
          status_text: summary,
          published: false, // Default to unpublished
          user_id: userId,
          created_at: new Date().toISOString(),
        })

      if (dbError) throw dbError

      // Clear form on success
      setEntryText('')
      // Trigger refresh of the journal list
      onEntrySubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!userId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">New Journal Entry</h2>
        <div className="text-center text-gray-500">
          Please log in to submit journal entries
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">New Journal Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            placeholder="Write your journal entry here..."
            className="w-full h-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Entry'}
        </button>
      </form>
    </div>
  )
} 