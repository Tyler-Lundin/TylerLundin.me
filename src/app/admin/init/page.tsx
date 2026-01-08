'use client';

import { useState } from 'react';
import { bootstrapAdminAction } from './actions';
import { Loader2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminInitPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [magicLink, setMagicLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const res = await bootstrapAdminAction(email, fullName);
      if (res.success) {
        setStatus('success');
        setMagicLink(res.link || null);
      } else {
        setStatus('error');
        setError(res.message || 'Initialization failed');
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'An unexpected error occurred');
    }
  };

  if (status === 'success') {
    return (
      <main className="min-h-screen grid place-content-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 text-center animate-in fade-in zoom-in-95">
          <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
            <CheckCircle2 className="size-12" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Admin Initialized</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            User <strong>{email}</strong> has been created with the <strong>admin</strong> role.
          </p>
          
          {magicLink && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-left">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">One-Time Login Link:</p>
              <code className="text-[11px] break-all text-neutral-700 dark:text-neutral-300 block bg-white dark:bg-black/50 p-2 rounded border border-blue-100 dark:border-blue-900/50">
                {magicLink}
              </code>
              <a 
                href={magicLink}
                className="mt-4 block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Login Now
              </a>
            </div>
          )}

          <p className="text-xs text-neutral-500">
            This page is now disabled. If you refresh, you will not be able to see this link again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-content-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-400">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Admin Bootstrap</h1>
            <p className="text-xs text-neutral-500">Initialize the first administrator account.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1.5 ml-1">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1.5 ml-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="System Administrator"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              required
            />
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-start gap-2 border border-red-100 dark:border-red-800/50">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? <Loader2 className="animate-spin size-5" /> : 'Initialize System'}
          </button>
        </form>

        <p className="mt-6 text-[10px] text-neutral-400 text-center leading-relaxed">
          SECURITY WARNING: This utility is only available when no administrators are present in the system. 
          Once an admin is created, this route will become inactive.
        </p>
      </div>
    </main>
  );
}
