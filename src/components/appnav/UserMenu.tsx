"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Role = 'admin' | 'head_of_marketing' | 'member' | string | null

function roleLabel(role: Role) {
  if (role === 'admin') return 'Admin'
  if (role === 'head_of_marketing' || role === 'head of marketing') return 'Head of Marketing'
  if (role) return String(role).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return 'Guest'
}

function roleHome(role: Role) {
  if (role === 'admin') return '/dev'
  if (role === 'head_of_marketing' || role === 'head of marketing') return '/marketing'
  return '/login?redirect=/dev'
}

export default function UserMenu({ openProp, onClose, onToggle }: { openProp?: boolean; onClose?: () => void; onToggle?: () => void }) {
  const [open, setOpen] = useState(false);
  const isOpen = openProp ?? open;
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'guest'>('loading');
  const [role, setRole] = useState<Role>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const close = useCallback(() => { if (onClose) onClose(); else setOpen(false); }, [onClose]);
  const toggle = useCallback(() => { if (onToggle) onToggle(); else setOpen((v) => !v); }, [onToggle]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Backquote" || e.key === "`" || e.key === "~") { e.preventDefault(); toggle(); }
      else if (e.key === "Escape") { close(); }
    }
    function onToggleEvent() { toggle(); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("admin-menu-toggle", onToggleEvent as any);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("admin-menu-toggle", onToggleEvent as any);
    };
  }, [toggle, close]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const probe = async () => {
      try {
        setStatus('loading')
        const res = await fetch('/api/auth/verify-token', { cache: 'no-store' })
        const d = await res.json()
        if (!active) return
        if (d?.success) { setStatus('authenticated'); setRole(d?.role || null); setUserId(d?.userId || null); return }
        // try silent refresh
        const ref = await fetch('/api/auth/refresh', { method: 'POST' })
        if (ref.ok) {
          const res2 = await fetch('/api/auth/verify-token', { cache: 'no-store' })
          const d2 = await res2.json()
          if (!active) return
          if (d2?.success) { setStatus('authenticated'); setRole(d2?.role || null); setUserId(d2?.userId || null); return }
        }
        setStatus('guest'); setRole(null)
      } catch { if (!active) return; setStatus('guest'); setRole(null) }
    }
    probe()
    return () => { active = false }
  }, [isOpen])

  const signOut = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    window.location.href = "/login";
  };

  if (!isOpen) return null;

  const indicator = role === 'admin' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
    : (role === 'head_of_marketing' || role === 'head of marketing') ? 'bg-sky-500'
    : status === 'loading' ? 'bg-yellow-500'
    : 'bg-red-500'

  const homeHref = status === 'authenticated' ? roleHome(role) : '/login'
  const ctaLabel = status === 'authenticated' ? (role === 'admin' ? 'Open Console' : role === 'head_of_marketing' || role === 'head of marketing' ? 'Open Marketing' : 'Open') : 'Login to Access'

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={close} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-md animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 mix-blend-overlay">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950" />
        </div>
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
              <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" /></svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">USER MENU</h2>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${indicator}`} />
                <span className="text-[10px] uppercase font-medium text-white/40">
                  {status === 'loading' ? 'Checking…' : roleLabel(role)}
                </span>
              </div>
            </div>
          </div>
          <button onClick={close} className="group flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-white/50 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white">ESC</button>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="group relative flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.06]">
              <div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <h3 className="text-sm font-medium text-white">Workspace</h3>
                <p className="mt-1 text-xs text-zinc-400">Open the appropriate console for your role.</p>
              </div>
              <div className="mt-4">
                <Link href={homeHref} onClick={close} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-xs font-semibold text-black transition-transform active:scale-95 hover:bg-zinc-200">
                  {ctaLabel}
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </div>
            <div className="group relative flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.06]">
              <div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </div>
                <h3 className="text-sm font-medium text-white">Session</h3>
                <p className="mt-1 text-xs text-zinc-400">Manage your current session and permissions.</p>
              </div>
              <div className="mt-4">
                {status === 'authenticated' ? (
                  <button onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20 active:scale-95">Terminate Session</button>
                ) : (
                  <div className="flex w-full items-center justify-center rounded-lg border border-white/5 bg-white/5 py-2 text-xs text-white/30 cursor-not-allowed">No Active Session</div>
                )}
              </div>
            </div>
                      <div className="group relative flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.06] sm:col-span-2">
              <div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 className="text-sm font-medium text-white">My Profile</h3>
                <p className="mt-1 text-xs text-zinc-400">View and edit your public profile and avatar.</p>
              </div>
              <div className="mt-4">
                {status === 'authenticated' && userId ? (
                  <a href={`/profile/${userId}`} onClick={close} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-xs font-semibold text-black transition-transform active:scale-95 hover:bg-zinc-200">
                    Open My Profile
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </a>
                ) : (
                  <div className="flex w-full items-center justify-center rounded-lg border border-white/5 bg-white/5 py-2 text-xs text-white/30 cursor-not-allowed">Login required</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-black/20 px-6 py-3 text-center">
          <p className="font-mono text-[10px] text-white/30 tracking-wider">PRESS ` TO TOGGLE</p>
        </div>
      </div>
    </div>
  );
}
