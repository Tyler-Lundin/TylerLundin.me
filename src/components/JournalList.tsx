'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { MoreVertical, Edit, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'

interface JournalEntry {
  id: string
  entry_text: string
  status_text: string
  created_at: string
  published: boolean
}

interface JournalListProps {
  refreshTrigger?: number
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function JournalList({ refreshTrigger = 0 }: JournalListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const entriesPerPage = 10

  const verifyAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/verify-token')
      const data = await response.json()
      setIsAuthenticated(data.success)
    } catch (error) {
      console.error('Error verifying authentication:', error)
      setIsAuthenticated(false)
    }
  }, [])

  const fetchEntries = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      setIsLoading(true)
      
      // Get total count
      const { count } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })

      setTotalCount(count || 0)
      
      // Fetch paginated entries
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, entry_text, status_text, created_at, published')
        .order('created_at', { ascending: false })
        .range((page - 1) * entriesPerPage, page * entriesPerPage - 1)

      if (error) throw error
      setEntries(data || [])
      setHasMore((page * entriesPerPage) < (count || 0))
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, page])

  useEffect(() => {
    verifyAuth()
  }, [verifyAuth])

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries()
    }
  }, [isAuthenticated, fetchEntries, refreshTrigger, page])

  const handlePublishToggle = async (entryId: string, currentPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ published: !currentPublished })
        .eq('id', entryId)

      if (error) throw error
      fetchEntries()
      setMenuOpenId(null)
    } catch (error) {
      console.error('Error updating entry:', error)
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error
      fetchEntries()
      setMenuOpenId(null)
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  if (!isAuthenticated) {
    return <div className="text-center py-4 text-red-500">You are not authorized to view this content.</div>
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading entries...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-xl p-6">
            {/* Menu Button */}
            <button
              onClick={() => setMenuOpenId(menuOpenId === entry.id ? null : entry.id)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {menuOpenId === entry.id && (
              <div className="absolute top-12 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg py-2 w-48 z-10 border border-gray-200/30 dark:border-gray-700/30">
                <button
                  onClick={() => handlePublishToggle(entry.id, entry.published)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                >
                  {entry.published ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Make Public
                    </>
                  )}
                </button>
                <button
                  onClick={() => {/* TODO: Implement edit functionality */}}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}

            {/* Entry Content */}
            <div className="pr-8">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    entry.published ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">{entry.entry_text}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">{entry.status_text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/30 dark:border-gray-800/30">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {((page - 1) * entriesPerPage) + 1} to {Math.min(page * entriesPerPage, totalCount)} of {totalCount} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-200/30 dark:border-gray-700/30 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-200/30 dark:border-gray-700/30 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
