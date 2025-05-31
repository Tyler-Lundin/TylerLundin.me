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
      <div className="relative backdrop-blur-md bg-white/5 dark:bg-black/10 rounded-2xl border border-white/10 dark:border-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)] p-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 via-fuchsia-500/20 to-indigo-500/20 pointer-events-none rounded-2xl" />
        <div className="relative">
          <h2 className="text-xl font-light tracking-wider mb-4 text-gray-800 dark:text-white/90">New Journal Entry</h2>
          <div className="text-center text-gray-500 dark:text-white/70">
            Please log in to submit journal entries.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative backdrop-blur-md bg-white/5 dark:bg-black/10 rounded-2xl border border-white/10 dark:border-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)] p-6">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 via-fuchsia-500/20 to-indigo-500/20 pointer-events-none rounded-2xl" />
      <div className="relative">
        <h2 className="text-xl font-light tracking-wider mb-4 text-gray-800 dark:text-white/90">New Journal Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder="Write your journal entry here..."
              className="w-full h-48 p-4 bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-gray-800 dark:text-white/90 placeholder-gray-500 dark:placeholder-white/30 backdrop-blur-sm transition-all duration-300"
              required
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full group relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white/90 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-xl border border-cyan-500/20 dark:border-cyan-500/10 hover:bg-cyan-500/30 dark:hover:bg-cyan-500/20 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {isSubmitting ? 'Submitting...' : 'Submit Entry'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </button>
        </form>
      </div>
    </div>
  )
}
