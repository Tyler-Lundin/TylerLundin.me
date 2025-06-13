'use client'

import { useState, useEffect } from 'react'
import { submitJournal } from '../app/actions/submit-journal'

interface JournalFormProps {
  onEntrySubmitted: () => void
}

export default function JournalForm({ onEntrySubmitted }: JournalFormProps) {
  const [entryText, setEntryText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify-token')
        const data = await response.json()
        setIsAuthenticated(data.success)
      } catch (error) {
        console.error('Error verifying authentication:', error)
        setIsAuthenticated(false)
      }
    }

    verifyAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!isAuthenticated) {
      setError('You must be logged in to submit a journal entry.')
      setIsSubmitting(false)
      return
    }

    try {
      await submitJournal(entryText)
      setEntryText('')
      onEntrySubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">New Journal Entry</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please log in to submit journal entries.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-xl p-4">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">New Journal Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            placeholder="Write your journal entry here..."
            className="w-full h-48 p-4 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-300 resize-none"
            required
          />
        </div>
        {error && (
          <div className="text-sm text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-lg p-3">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-500 disabled:hover:to-pink-500"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Entry'}
        </button>
      </form>
    </div>
  )
}
