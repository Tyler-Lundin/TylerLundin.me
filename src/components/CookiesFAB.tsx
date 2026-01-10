"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CookiesModal from './CookiesModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookiesFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Visibility states
  const [isVisible, setIsVisible] = useState(false); // Controls the slide in/out animation
  const [isPermanentlyHidden, setIsPermanentlyHidden] = useState(true); // Default to true to prevent flash
  const [isSessionHidden, setIsSessionHidden] = useState(true); // Default to true to prevent flash

  useEffect(() => {
    // Check initial state on mount
    const consent = localStorage.getItem('cookie-consent');
    const sessionDismissed = sessionStorage.getItem('cookie-dismissed');
    
    setIsPermanentlyHidden(!!consent);
    setIsSessionHidden(!!sessionDismissed);

    // Listen for consent changes
    const handleConsentChange = () => {
      const newConsent = localStorage.getItem('cookie-consent');
      if (newConsent) {
        setIsPermanentlyHidden(true);
      }
    };

    window.addEventListener('cookie-consent-changed', handleConsentChange);
    return () => window.removeEventListener('cookie-consent-changed', handleConsentChange);
  }, []);

  // Animation loop
  useEffect(() => {
    if (isPermanentlyHidden || isSessionHidden) {
      setIsVisible(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    
    const runLoop = () => {
      // Slide in
      setIsVisible(true);
      
      // Stay visible for 8 seconds
      timeoutId = setTimeout(() => {
        // Slide out
        if (!isHovered) { // Don't slide out if user is hovering
             setIsVisible(false);
        }
        
        // Wait 30 seconds before sliding in again
        timeoutId = setTimeout(runLoop, 30000);
      }, 8000);
    };

    // Initial delay before first appearance
    const initialDelay = setTimeout(runLoop, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialDelay);
    };
  }, [isPermanentlyHidden, isSessionHidden, isHovered]);

  const handleOpen = () => {
    setIsOpen(true);
    // Mark as dismissed for this session immediately upon interaction
    sessionStorage.setItem('cookie-dismissed', 'true');
    setIsSessionHidden(true);
  };

  // If permanently hidden, don't render anything (except the modal if it's open, though logically it shouldn't be)
  // We keep the component mounted so the Modal can still work if it was just opened.
  
  const isExpanded = isHovered;

  return (
    <>
      <AnimatePresence>
        {(!isPermanentlyHidden && !isSessionHidden && isVisible) && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="fixed right-6 bottom-6 z-50 flex items-center"
          >
            <motion.button
              onClick={handleOpen}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              layout
              initial={{ borderRadius: 24 }}
              className="relative flex flex-row-reverse items-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden group"
              style={{ height: '48px' }}
            >
              {/* The Icon (Always Visible - Right Aligned) */}
              <div className="w-12 h-12 flex items-center justify-center shrink-0 z-10">
                <motion.div
                  animate={{ 
                    rotate: isExpanded ? 35 : 0,
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

              {/* The Text (Reveals to the Left) */}
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
                  <span className="whitespace-nowrap pl-5 pr-1 text-sm font-medium text-neutral-600 dark:text-neutral-200">
                    Cookie Preferences
                  </span>
                </motion.div>
              </div>

              {/* Subtle background shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <CookiesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
