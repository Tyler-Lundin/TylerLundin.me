"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { aboutConfig } from '@/config/about';

export default function StatsDrawer() {
  const stats = aboutConfig.stats ?? [];
  const [open, setOpen] = useState(false);

  if (!stats.length) return null;

  const isOpen = open;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className="fixed right-0 top-[25vh] z-[100] select-none"
    >
      <div className="flex items-stretch justify-end">
        {/* Sliding panel anchored to the viewport edge */}
        <motion.div
          initial={{ x: '100%', opacity: 0.95 }}
          animate={{ x: isOpen ? 0 : '100%', opacity: isOpen ? 1 : 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="pointer-events-auto"
          aria-hidden={!isOpen}
        >
          <div className="rounded-l-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black  px-3 py-2 shadow-lg min-w-[12rem]">
            <ul className="space-y-1">
              {stats.map((s) => (
                <li key={s.label} className="text-xs text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{s.value}</span>
                  <span className="mx-1 opacity-50">•</span>
                  <span className="opacity-90">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Handle flush with right-0 */}
        <button
          type="button"
          aria-label={isOpen ? 'Hide quick stats' : 'Show quick stats'}
          aria-expanded={isOpen}
          className={`pointer-events-auto group ${isOpen ? 'rounded-none' : 'rounded-l-md' } transition-all border border-black/10 dark:border-white/15 bg-white/90 dark:bg-white/10 backdrop-blur px-2 py-2 shadow-md hover:shadow-lg text-neutral-900 dark:text-neutral-100`}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block"
          >
            <path d="M8 21h8M12 17a6 6 0 0 1-6-6V3h12v8a6 6 0 0 1-6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 5h3a3 3 0 0 1-3 3M6 5H3a3 3 0 0 0 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
