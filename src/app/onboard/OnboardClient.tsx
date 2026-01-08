'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function OnboardClient() {
  const sp = useSearchParams()
  const token = sp.get('token') || ''
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [magicLink, setMagicLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/team/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          profile: { 
            full_name: fullName,
            headline,
            bio
          } 
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to complete onboarding')
      
      if (data.link) {
        setMagicLink(data.link)
      } else {
        router.push('/login?status=onboarded')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (magicLink) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-emerald-100 dark:from-emerald-950 via-white dark:via-gray-900 to-emerald-100 dark:to-emerald-950 p-6">
        <div className="w-full max-w-md text-center space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/30">
          <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Profile Ready!</h1>
          <p className="text-gray-600 dark:text-gray-400">Your account has been initialized. Use the link below to access your dashboard.</p>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-left">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Login Link:</p>
            <a 
              href={magicLink}
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Enter Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-indigo-200 dark:from-indigo-900 via-white dark:via-gray-900 to-indigo-200 dark:to-indigo-900 animate-gradient-slow p-6">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-lg dark:text-white">Complete Profile</h1>
          <p className="text-gray-600 uppercase tracking-widest text-sm dark:text-white">Set up your identity</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-left bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20"
        >
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 ml-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-6 py-4 rounded-2xl text-lg bg-white dark:bg-zinc-900 shadow-inner border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-4 focus:ring-indigo-400/20 transition dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 ml-1">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Full Stack Developer, Designer..."
              className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-inner border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-4 focus:ring-indigo-400/20 transition dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 ml-1">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-inner border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-4 focus:ring-indigo-400/20 transition dark:text-white"
            />
          </div>

          {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin size-5" /> : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  )
}

