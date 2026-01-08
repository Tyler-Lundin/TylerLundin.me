'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { sendLoginLinkAction } from '@/app/actions/auth'
import ReactiveBackground from '@/components/ReactiveBackground'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    try {
      const res = await sendLoginLinkAction(email, redirectPath || undefined)
      if (res.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setError(res.message || 'Login failed')
      }
    } catch (err) {
      setStatus('error')
      setError('An unexpected error occurred')
    }
  }

  if (status === 'success') {
    return (
      <div className="w-full max-w-md p-8 bg-white/90 dark:bg-neutral-900/90 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 text-center animate-in fade-in zoom-in-95">
        <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
          <CheckCircle2 className="size-12" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Check your email</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          We sent a magic login link to <strong>{email}</strong>.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-sm text-blue-600 hover:underline"
        >
          Try another email
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md p-8 bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Enter your email to access your dashboard.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 size-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              autoFocus
            />
          </div>
        </div>

        {status === 'error' && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center border border-red-100 dark:border-red-800/50">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black font-bold text-lg py-3.5 rounded-xl shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
        >
          {status === 'loading' ? <Loader2 className="animate-spin size-5" /> : <>Sign In <ArrowRight className="size-5" /></>}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (<>
    <div className="fixed inset-0 -z-10 opacity-60 ">
      <ReactiveBackground />
    </div>
    <main className="max-w-full h-[700px] grid place-content-center overflow-hidden backdrop-blur-sm mx-2 md:mx-4 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit z-10 text-black dark:text-white ">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  </>)
}
