'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OnboardClient() {
  const sp = useSearchParams()
  const token = sp.get('token') || ''
  const router = useRouter()

  const [passwords, setPasswords] = useState(['', '', ''])
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (i: number, v: string) => {
    const next = [...passwords]
    next[i] = v
    setPasswords(next)
  }

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-indigo-200 dark:from-indigo-900 via-white dark:via-gray-900 to-indigo-200 dark:to-indigo-900 animate-gradient-slow p-6">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-lg dark:text-white">Welcome</h1>
          <p className="text-gray-600 uppercase tracking-widest text-sm dark:text-white">Set your credentials</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setLoading(true)
            setError(null)
            try {
              const res = await fetch('/api/team/complete-onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, passwords, profile: { full_name: fullName } }),
              })
              const data = await res.json()
              if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to complete onboarding')
              router.push('/login?redirect=/dev')
            } catch (err: any) {
              setError(err.message || 'Something went wrong')
            } finally {
              setLoading(false)
            }
          }}
          className="space-y-4 text-left"
        >
          <div>
            <label className="block text-[11px] text-gray-600 dark:text-gray-300 mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-6 py-4 rounded-2xl text-lg bg-white/80 dark:bg-black shadow-inner border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {passwords.map((p, i) => (
              <div key={i}>
                <label className="block text-[11px] text-gray-600 dark:text-gray-300 mb-1">Password {i + 1}</label>
                <input
                  type="password"
                  value={p}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl text-lg bg-white/80 dark:bg-black shadow-inner border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
                  required
                />
              </div>
            ))}
          </div>
          {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white text-lg font-semibold py-4 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Complete Onboarding'}
          </button>
        </form>
      </div>
    </div>
  )
}

