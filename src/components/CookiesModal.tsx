"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookiesModal({ isOpen, onClose }: CookiesModalProps) {
  const [consent, setConsent] = useState<{
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cookie-consent');
    if (saved) {
      setConsent(JSON.parse(saved));
    } else {
      setConsent({
        essential: true,
        analytics: false,
        marketing: false,
      });
    }
  }, []);

  const saveConsent = (newConsent: typeof consent) => {
    if (!newConsent) return;
    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    onClose();
    // Here we would trigger the "safeguards" or enable/disable scripts
    window.dispatchEvent(new Event('cookie-consent-changed'));
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
    });
  };

  const declineAll = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
    });
  };

  if (!consent) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 relative">
                  <img src="/images/cookie.webp" alt="Cookie" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Cookie Preferences</h2>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">I use cookies to enhance your experience.</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Essential</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Required for the site to function properly.</p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-neutral-300 dark:bg-neutral-700 relative opacity-50 cursor-not-allowed">
                    <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Analytics</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Help us understand how visitors use our site.</p>
                  </div>
                  <button
                    onClick={() => setConsent({ ...consent, analytics: !consent.analytics })}
                    className={`h-6 w-11 rounded-full transition-colors relative ${consent.analytics ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                  >
                    <motion.div
                      animate={{ x: consent.analytics ? 30 : 4 }}
                      className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Marketing</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Used to deliver more relevant advertisements.</p>
                  </div>
                  <button
                    onClick={() => setConsent({ ...consent, marketing: !consent.marketing })}
                    className={`h-6 w-11 rounded-full transition-colors relative ${consent.marketing ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                  >
                    <motion.div
                      animate={{ x: consent.marketing ? 30 : 4 }}
                      className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={declineAll}
                  className="px-6 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Decline All
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
                >
                  Accept All
                </button>
              </div>
              
              <button
                onClick={() => saveConsent(consent)}
                className="w-full mt-3 px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
