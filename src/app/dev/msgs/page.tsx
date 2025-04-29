'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'
import { MoreVertical, Trash2 } from 'lucide-react'
import Link from 'next/link'

type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row']

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setMessages(data)

      setLoading(false)
    }

    fetchMessages()
  }, [supabase])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove the deleted message from the state
      setMessages(prev => prev.filter(msg => msg.id !== id))
    } catch (err) {
      console.error('Error deleting message:', err)
    }
  }

  if (loading) return <p className="text-gray-500">Loading messages...</p>

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">All Messages</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDelete(!showDelete)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            <Link
              href="/dev"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to Dev
            </Link>
          </div>
        </div>

        <ul className="divide-y divide-neutral-200">
          {messages.map(msg => (
            <li key={msg.id} className="py-4 relative group">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">{msg.name}</span>
                <span className="text-sm text-gray-500">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 text-sm mt-1">{msg.message}</p>
              <p className="text-xs text-gray-500 italic mt-1">{msg.email}</p>
              {msg.budget && (
                <p className="text-xs text-gray-500 mt-1">Budget: {msg.budget}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Status: {msg.status}</p>
              
              {showDelete && (
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 