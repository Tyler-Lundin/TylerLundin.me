'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import JournalForm from '@/components/JournalForm'
import JournalList from '@/components/JournalList'
import ContactMessagesList from '@/components/ContactMessagesList'
import DashboardHeader from '@/components/DashboardHeader'

export default function DevDashboard() {
  const [refreshJournal, setRefreshJournal] = useState(0)
  const [refreshContacts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string | null>('journal')
  const router = useRouter()

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-token')
        const data = await response.json()

        if (!data.success) {
          // If token is invalid, redirect to login
          router.push('/login')
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error verifying token:', error)
        router.push('/login')
      }
    }

    verifyToken()
  }, [router])

  const handleJournalSubmitted = () => setRefreshJournal(prev => prev + 1)

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 px-4 py-8 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <DashboardHeader title="Dev Dashboard" />

        {/* Contact Messages Section */}
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('contacts')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Contact Messages</h2>
            {activeSection === 'contacts' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          <AnimatePresence>
            {activeSection === 'contacts' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-6 pb-6">
                  <ContactMessagesList refreshTrigger={refreshContacts} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Journal Section */}
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('journal')}
            className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Journal</h2>
            {activeSection === 'journal' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          <AnimatePresence>
            {activeSection === 'journal' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-2 sm:px-6 pb-6 space-y-6">
                  <JournalForm onEntrySubmitted={handleJournalSubmitted} />
                  <JournalList refreshTrigger={refreshJournal} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 
