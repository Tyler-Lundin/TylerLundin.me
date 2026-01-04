"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type AuthStatus = 'loading' | 'guest' | 'member' | 'admin'

export default function AdminMenu({ openProp, onClose, onToggle }: { openProp?: boolean; onClose?: () => void; onToggle?: () => void }) {
  const [open, setOpen] = useState(false);
  const isOpen = openProp ?? open;
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  const close = useCallback(() => {
    if (onClose) onClose(); else setOpen(false);
  }, [onClose]);
  const toggle = useCallback(() => {
    if (onToggle) onToggle(); else setOpen((v) => !v);
  }, [onToggle]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Backquote" || e.key === "`" || e.key === "~") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape") {
        close();
      }
    }
    function onToggleEvent() {
      toggle();
    }
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
    const check = async () => {
      try {
        setAuthStatus('loading');
        const res = await fetch('/api/auth/verify-token', { cache: 'no-store' });
        const d = await res.json();
        if (!active) return;
        if (d?.success) {
          setAuthStatus(d.isAdmin ? 'admin' : 'member');
          return;
        }
        // Attempt refresh silently
        const ref = await fetch('/api/auth/refresh', { method: 'POST' });
        if (ref.ok) {
          const res2 = await fetch('/api/auth/verify-token', { cache: 'no-store' });
          const d2 = await res2.json();
          if (!active) return;
          if (d2?.success) {
            setAuthStatus(d2.isAdmin ? 'admin' : 'member');
            return;
          }
        }
        setAuthStatus('guest');
      } catch {
        if (!active) return;
        setAuthStatus('guest');
      }
    };
    check();
    return () => { active = false; };
  }, [isOpen]);

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={close} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-md animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        
        {/* Background Texture/Image */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 mix-blend-overlay">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
               {/* Terminal Icon */}
              <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">COMMAND MENU</h2>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${authStatus === 'admin' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : authStatus === 'member' ? 'bg-sky-500' : authStatus === 'loading' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <span className="text-[10px] uppercase font-medium text-white/40">
                  {authStatus === 'loading' ? 'Checking...' : authStatus === 'admin' ? 'Admin' : authStatus === 'member' ? 'Authenticated' : 'Guest Mode'}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={close}
            className="group flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-white/50 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            
            {/* Developer Card */}
            <div className="group relative flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.06]">
              <div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-white">Developer Console</h3>
                <p className="mt-1 text-xs text-zinc-400">Access database tools, logs, and API configurations.</p>
              </div>
              <div className="mt-4">
                <Link
                  href={authStatus === 'admin' ? "/dev" : "/login?redirect=/dev"}
                  onClick={close}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-xs font-semibold text-black transition-transform active:scale-95 hover:bg-zinc-200"
                >
                  {authStatus === 'admin' ? "Open Console" : "Login to Access"}
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Session Card */}
            <div className="group relative flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.06]">
              <div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-white">Session Control</h3>
                <p className="mt-1 text-xs text-zinc-400">Manage current active session and permissions.</p>
              </div>
              <div className="mt-4">
                {authStatus === 'admin' || authStatus === 'member' ? (
                  <button
                    onClick={signOut}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
                  >
                    Terminate Session
                  </button>
                ) : (
                  <div className="flex w-full items-center justify-center rounded-lg border border-white/5 bg-white/5 py-2 text-xs text-white/30 cursor-not-allowed">
                    No Active Session
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/20 px-6 py-3 text-center">
            <p className="font-mono text-[10px] text-white/30 tracking-wider">
                PRESS ` TO TOGGLE
            </p>
        </div>
      </div>
    </div>
  );
}
