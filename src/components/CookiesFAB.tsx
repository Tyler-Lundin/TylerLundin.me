"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import CookiesModal from './CookiesModal';
import { motion } from 'framer-motion';

export default function CookiesFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInitialPrompt, setShowInitialPrompt] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Combine hover state and initial prompt to determine if we expand
  const isExpanded = isHovered || showInitialPrompt;


  const handleOpen = () => {
    setIsOpen(true);
    // Dismiss the initial prompt permanently once clicked
    setShowInitialPrompt(false);
  };

  return (
    <>
      <div className="fixed left-0 top-1/2 z-50 flex items-center pl-2">
        <motion.button
          onClick={handleOpen}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          layout
          initial={{ borderRadius: 24 }}
          className="relative flex items-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden group"
          style={{ height: '48px' }}
        >
          {/* The Icon (Always Visible - Left Aligned) */}
          <div className="w-12 h-12 flex items-center justify-center shrink-0 z-10">
            <motion.div
              animate={{ 
                rotate: isExpanded ? -35 : 0,
                scale: isExpanded ? 1.1 : 1
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative w-7 h-7"
            >
              <Image
                src="/images/cookie.webp"
                alt="Cookie"
                fill
                className="object-contain drop-shadow-sm"
              />
            </motion.div>
          </div>

          {/* The Text (Reveals to the Right) */}
          <div className="overflow-hidden flex items-center">
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: isExpanded ? "auto" : 0, 
                opacity: isExpanded ? 1 : 0 
              }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="flex items-center"
            >
              <span className="whitespace-nowrap pr-5 pl-1 text-sm font-medium text-neutral-600 dark:text-neutral-200">
                Cookie Preferences
              </span>
            </motion.div>
          </div>

          {/* Subtle background shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
        </motion.button>
      </div>

      <CookiesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
