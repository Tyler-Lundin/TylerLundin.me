"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[10001] pointer-events-none">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ width: "0%", opacity: 1 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              width: { duration: 0.5, ease: "easeOut" },
              opacity: { duration: 0.2 }
            }}
            className="h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
