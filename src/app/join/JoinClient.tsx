'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function JoinClient() {
  const [email, setEmail] = useState('')
  const [key, setKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const sp = useSearchParams()

  const invitedEmail = sp.get('email') || ''

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-indigo-200 dark:from-indigo-900 via-white dark:via-gray-900 to-indigo-200 dark:to-indigo-900 animate-gradient-slow p-6">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-lg dark:text-white">Team Invite</h1>
          <p className="text-gray-600 uppercase tracking-widest text-sm dark:text-white">Enter your 4-digit key</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setLoading(true)
            setError(null)
            try {
              const payload = { email: email || invitedEmail, key }
              const res = await fetch('/api/team/verify-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              })
              const data = await res.json()
              if (!res.ok || !data.ok) throw new Error(data.message || 'Invalid key')
              router.push(`/onboard?token=${encodeURIComponent(data.token)}`)
            } catch (err: any) {
              setError(err.message || 'Something went wrong')
            } finally {
              setLoading(false)
            }
          }}
          className="space-y-4"
        >
          <div className="text-left space-y-3">
            <div>
              <label className="block text-[11px] text-gray-600 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email || invitedEmail}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl text-lg bg-white/80 dark:bg-black shadow-inner border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 dark:text-gray-300 mb-1">4-digit key</label>
              <input
                type="text"
                pattern="[0-9]{4}"
                title="Enter 4 digits"
                maxLength={4}
                inputMode="numeric"
                required
                value={key}
                onChange={(e) => setKey(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="1234"
                className="w-full px-6 py-4 rounded-2xl text-lg bg-white/80 dark:bg-black shadow-inner border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition tracking-[0.4em] text-center"
              />
            </div>
          </div>
          {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white text-lg font-semibold py-4 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify Key'}
          </button>
        </form>
      </div>
    </div>
  )
}
