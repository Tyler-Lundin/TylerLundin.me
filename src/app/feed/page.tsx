'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, Quote } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// Types
interface JournalEntry {
  id: string
  entry_text: string
  status_text: string
  created_at: string
}

// Utils
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }
}

// Components
function EntryCard({ entry }: { entry: JournalEntry }) {
  const { date, time } = formatDate(entry.created_at)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex items-center gap-6 mb-4 text-gray-400 text-xs font-light relative h-10">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {date}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {time}
        </div>
        <span className="w-8 h-8 rounded-full bg-gray-200 border border-gray-900 overflow-hidden flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-3">
          <Image src="/images/tyler.png" alt="Tyler Lundin" width={48} height={48} />
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 bg-black rounded-md px-3 py-1 w-fit">
          <span className="text-md bg-gradient-to-r from-indigo-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent font-medium">
            tldr:
          </span>
          <p className="text-xs bg-gradient-to-r from-indigo-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent font-light">
            {entry.status_text}
          </p>
        </div>

        <blockquote className="text-gray-700 text-sm leading-relaxed font-light relative py-12">
          <span className="text-gray-200 absolute top-0 left-0">
            <Quote className="w-12 h-12" />
          </span>
          <span className="font-medium text-xl">{entry.entry_text}</span>
          <span className="text-gray-200 absolute bottom-0 h-fit right-0">
            <Quote className="w-12 h-12" />
          </span>
        </blockquote>
      </div>
    </motion.div>
  )
}

function PaginationControls({
  page,
  hasMore,
  setPage,
}: {
  page: number
  hasMore: boolean
  setPage: (page: number) => void
}) {
  return (
    <div className="flex justify-center gap-4 mt-12">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPage(page + 1)}
        disabled={!hasMore}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
      <div className="text-gray-400 font-light text-sm animate-pulse">Loading entries...</div>
    </div>
  )
}

// Main Page
export default function FeedPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('journal_entries')
          .select('id, entry_text, status_text, created_at')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .range((page - 1) * 10, page * 10 - 1)

        if (error) throw error

        setEntries(data || [])
        setHasMore((data || []).length === 10)
      } catch (error) {
        console.error('Error fetching entries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [page])

  if (isLoading) return <LoadingState />

  return (
    <section id="feed" className="py-32 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-2xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </motion.div>
        </AnimatePresence>

        <PaginationControls page={page} hasMore={hasMore} setPage={setPage} />
      </div>
    </section>
  )
}
