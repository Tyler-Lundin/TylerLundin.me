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
    <div className="fixed right-0 top-24 z-50 flex items-center justify-end pr-2"> {/* Added pr-2 for breathing room */}
      <motion.button
        onClick={toggleMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        layout
        initial={{ borderRadius: 24 }} // Start fully rounded
        className="relative flex items-center flex-row-reverse bg-white/80 dark:bg-black/60 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden group"
        // Dynamic styling based on hover state for size
        style={{ height: '48px' }}
      >
        {/* The Icon (Always Visible) */}
        <div className="w-12 h-12 flex items-center justify-center shrink-0 z-10">
          <motion.div
            animate={{ rotate: isHovered ? 35 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
             <User className="w-5 h-5 text-neutral-600 dark:text-neutral-200" />
          </motion.div>
        </div>

        {/* The Text (Reveals on Hover) */}
        <div className="overflow-hidden flex items-center">
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ 
                    width: isHovered ? "auto" : 0, 
                    opacity: isHovered ? 1 : 0 
                }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="flex items-center"
            >
                <span className="whitespace-nowrap pl-4 text-sm font-medium text-neutral-600 dark:text-neutral-200">
                    User Menu
                </span>
            </motion.div>
        </div>
        
        {/* Subtle background glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
      </motion.button>
    </div>
  );
}
