"use client";

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserMenuToggle() {
  const [isHovered, setIsHovered] = useState(false);

  const toggleMenu = () => {
    try { window.dispatchEvent(new Event('admin-menu-host-toggle')); } catch {}
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[9998] flex flex-row-reverse items-center group">
      <button
        onClick={toggleMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="User Menu"
        className="relative flex items-center justify-center w-12 h-14 bg-white/10 dark:bg-black/20 backdrop-blur-xl border-y border-l border-white/20 dark:border-white/10 rounded-l-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-500 hover:w-16 group-hover:pr-2"
      >
        <div className="relative w-8 h-8 transition-all duration-500 group-hover:rotate-[360deg] group-hover:scale-125 flex items-center justify-center">
          <User className="w-6 h-6 text-neutral-700 dark:text-white" />
        </div>
      </button>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mr-4 px-4 py-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 pointer-events-none whitespace-nowrap"
          >
            <p className="text-sm font-medium text-neutral-900 dark:text-white">Account Menu</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}