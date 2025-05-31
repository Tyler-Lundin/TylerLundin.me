'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

function LoginForm() {
  const [passwords, setPasswords] = useState(['', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dev'

  const handlePasswordChange = (index: number, value: string) => {
    const newPasswords = [...passwords]
    newPasswords[index] = value
    setPasswords(newPasswords)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Call server-side API to verify passwords
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passwords }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      if (!data.success) {
        throw new Error(data.message || 'Authentication failed')
      }

      // If verification successful, redirect to the original path or default to /dev
      router.push(redirectPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-indigo-200 dark:from-indigo-900 via-white dark:via-gray-900 to-indigo-200 dark:to-indigo-900 animate-gradient-slow p-6">
      <div className="w-full max-w-lg text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow-lg dark:text-white">
            ENTER THE HAVEN
          </h1>
          <p className="text-gray-600 uppercase tracking-widest text-sm dark:text-white">
            Authorized Entry Only
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {passwords.map((password, index) => (
              <div key={index} className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(index, e.target.value)}
                  placeholder={`Password ${index + 1}`}
                  className="w-full px-6 py-4 rounded-2xl text-lg bg-white/80 dark:bg-black shadow-inner border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                </div>
              </div>
            ))}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-indigo-200 dark:from-indigo-900 via-white dark:via-gray-900 to-indigo-200 dark:to-indigo-900 animate-gradient-slow p-6">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
