"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CookiesModal from './CookiesModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookiesFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInitialPrompt, setShowInitialPrompt] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show prompt after a short delay if no consent yet
      const timer = setTimeout(() => setShowInitialPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[9998] flex items-center group">
        <button
          onClick={() => {
            setIsOpen(true);
            setShowInitialPrompt(false);
          }}
          aria-label="Cookie Settings"
          className="relative flex items-center justify-center w-12 h-14 bg-white/10 dark:bg-black/20 backdrop-blur-xl border-y border-r border-white/20 dark:border-white/10 rounded-r-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-500 hover:w-16 group-hover:pl-2"
        >
          <div className="relative w-8 h-8 transition-all duration-500 group-hover:rotate-[360deg] group-hover:scale-125">
            <Image
              src="/images/cookie.webp"
              alt="Cookie"
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Subtle pulse for initial prompt */}
          {showInitialPrompt && (
            <span className="absolute inset-0 rounded-r-3xl animate-ping bg-white/20 pointer-events-none" />
          )}
        </button>

        <AnimatePresence>
          {showInitialPrompt && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="ml-4 px-4 py-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 pointer-events-none whitespace-nowrap"
            >
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Cookie Preferences</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CookiesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
