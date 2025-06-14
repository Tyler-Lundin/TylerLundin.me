'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react'
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
  const [showTLDR, setShowTLDR] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-xl p-4 hover:border-gray-300/50 dark:hover:border-gray-700/50 transition-all duration-300"
    >
      <div className="flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-pink-500/10 dark:from-indigo-400/10 dark:to-pink-400/10 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <Image 
                src="/images/tyler.png" 
                alt="Tyler Lundin" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {date}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {time}
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTLDR(!showTLDR)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              showTLDR 
                ? 'bg-white/80 dark:bg-gray-800/80 shadow-lg border border-gray-200/50 dark:border-gray-700/50' 
                : 'bg-gradient-to-r from-indigo-500/10 via-pink-500/10 to-yellow-500/10 dark:from-indigo-400/10 dark:via-pink-400/10 dark:to-yellow-400/10 hover:from-indigo-500/20 hover:via-pink-500/20 hover:to-yellow-500/20 dark:hover:from-indigo-400/20 dark:hover:via-pink-400/20 dark:hover:to-yellow-400/20'
            }`}
          >
            <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-400 dark:from-indigo-300 dark:via-pink-300 dark:to-yellow-300 bg-clip-text text-transparent">
              {showTLDR ? 'Tyler\'s Journal' : 'AI Summary'}
            </span>
          </motion.button>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={showTLDR ? 'tldr' : 'full'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[200px] overflow-y-auto"
          >
            {showTLDR ? (
              <div className="bg-gradient-to-br from-indigo-500/5 to-pink-500/5 dark:from-indigo-400/5 dark:to-pink-400/5 rounded-lg p-4 border border-indigo-200/30 dark:border-indigo-800/30">
                <small className=" text-gray-500 dark:text-gray-400 text-xs border-b border-black/50 dark:border-white/50">AI</small>
                <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-light">
                  {entry.status_text}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-500/5 to-pink-500/5 dark:from-indigo-400/5 dark:to-pink-400/5 rounded-lg p-4 border border-indigo-200/30 dark:border-indigo-800/30">
                <small className="text-gray-500 dark:text-gray-400 text-xs border-b border-black/50 dark:border-white/50">Tyler</small>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-light">
                  {entry.entry_text}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
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
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-200/80 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPage(page + 1)}
        disabled={!hasMore}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-200/80 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
      <div className="text-gray-400 dark:text-gray-500 font-light text-sm animate-pulse">Loading entries...</div>
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
    <section id="feed" className="py-32 min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-2xl mx-auto space-y-8 px-4">
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
