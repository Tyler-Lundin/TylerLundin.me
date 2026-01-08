'use client'

import { useState, useEffect } from 'react'
import { Edit3, X, Maximize2, Minimize2, Trash2 } from 'lucide-react'
import EditorForm, { EditablePost } from './EditorForm'
import { motion, AnimatePresence } from 'framer-motion'
import { deletePostAction } from '@/app/dev/actions/blog'
import { useRouter } from 'next/navigation'

export default function PostViewActions({ initial }: { initial: EditablePost }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Bind 'e' key to open editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDelete = async () => {
    if (!initial.id) return
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return

    setIsDeleting(true)
    try {
      const formData = new FormData()
      formData.append('id', initial.id)
      const res = await deletePostAction(null, formData)
      if (res?.success) {
        router.push('/dev/blog')
        router.refresh()
      }
    } catch (e) {
      alert('Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          title="Delete Post"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-neutral-900"
          title="Edit Post"
        >
          <Edit3 size={24} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`relative bg-neutral-50 shadow-2xl dark:bg-neutral-950 h-full overflow-y-auto border-l border-neutral-200 dark:border-neutral-800 transition-all duration-300 ease-in-out ${isExpanded ? 'w-full max-w-5xl' : 'w-full max-w-xl'}`}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-neutral-50/80 px-4 py-3 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Edit Post</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="hidden sm:flex items-center justify-center rounded-full p-2 text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center rounded-full p-2 text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6 pb-20">
                 {/* 
                    We wrap EditorForm in a div that overrides some of its internal container styles 
                    if possible via CSS specificity, or we just accept the nested card look.
                    For now, nested card is fine, acts as the "paper" on the drawer background.
                 */}
                 <EditorForm initial={initial} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
