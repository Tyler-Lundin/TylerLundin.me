"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut, LayoutDashboard, Shield, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useUser";

export default function UserButton({ variant = 'default' }: { variant?: 'default' | 'dashboard' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, loading } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close on click outside
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const isAdmin = role === 'admin' || role === 'owner';
  const isMarketing = role === 'head_of_marketing' || role === 'head of marketing';

  // Helper for initials
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.[0].toUpperCase() || '?';

  if (loading) return <div className={`rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse ${variant === 'dashboard' ? 'w-8 h-8' : 'w-9 h-9'}`} />;

  const buttonClasses = variant === 'dashboard'
    ? "flex items-center justify-center h-8 w-8 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-all dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-lg shadow-neutral-200 dark:shadow-none"
    : "flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-400 dark:focus:ring-neutral-600";

  const iconClasses = variant === 'dashboard'
    ? "w-4 h-4"
    : "w-5 h-5 text-neutral-500 dark:text-neutral-400";

  const textClasses = variant === 'dashboard'
    ? "text-[11px] font-black uppercase tracking-widest"
    : "text-sm font-semibold text-neutral-700 dark:text-neutral-200";

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        aria-label="User menu"
      >
        {user ? (
          <span className={textClasses}>{initials}</span>
        ) : (
          <UserCircle className={iconClasses} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl z-50 overflow-hidden"
          >
            {user ? (
              <>
                <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user.fullName || 'User'}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                  <div className="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 uppercase tracking-wide">
                    {role?.replace(/_/g, ' ') || 'Guest'}
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  {isAdmin && (
                    <Link href="/dev" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-2.5 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                      <Shield className="w-4 h-4" />
                      Admin Console
                    </Link>
                  )}
                  {(isAdmin || isMarketing) && (
                    <Link href="/marketing" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-2.5 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      Marketing Console
                    </Link>
                  )}
                  <Link href="/portal" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-2.5 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    Client Portal
                  </Link>
                  <Link href={`/profile/${user.id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-2.5 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                </div>

                <div className="p-1.5 border-t border-neutral-100 dark:border-neutral-800">
                  <button onClick={signOut} className="flex w-full items-center gap-2 px-2.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="p-1.5">
                <div className="px-2 py-2 text-xs text-neutral-500 text-center">
                  Sign in to access your account
                </div>
                <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-2.5 py-2 text-sm font-medium text-white bg-neutral-900 dark:bg-white dark:text-black hover:opacity-90 rounded-lg transition-opacity">
                  Sign In
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
