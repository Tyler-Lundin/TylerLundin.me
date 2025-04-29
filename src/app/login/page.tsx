'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

export default function LoginPage() {
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { supabase } = useSupabaseAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('admin_passwords')
        .select('*')
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error('No admin password record found.')

      const valid1 = await bcrypt.compare(password1, data.password1_hash)
      const valid2 = await bcrypt.compare(password2, data.password2_hash)

      if (!valid1 || !valid2) {
        throw new Error('Invalid credentials')
      }

      // Fake email for Supabase auth
      const email = 'tyler@tylerlundin.me'

      // Sign in using just one password (first one) to Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: password1, // We'll use password1 as the auth password
      })

      if (signInError) throw signInError

      router.push('/dev')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-white to-indigo-200 animate-gradient-slow p-6">
      <div className="w-full max-w-lg text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow-lg">
            ENTER THE HAVEN
          </h1>
          <p className="text-gray-600 uppercase tracking-widest text-sm">
            Authorized Entry Only
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <input
              id="password1"
              type="password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              placeholder="First Password"
              className="w-full px-6 py-4 rounded-2xl text-lg bg-white/80 shadow-inner border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
              required
            />
            <input
              id="password2"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Second Password"
              className="w-full px-6 py-4 rounded-2xl text-lg bg-white/80 shadow-inner border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 hover:from-indigo-600 hover:to-purple-600 text-white text-lg font-semibold py-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gaining Access...
              </span>
            ) : (
              'Unlock Portal'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
