'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Advertisement } from '@/types/marketing';

interface AdCarouselProps {
  ads: Advertisement[];
}

export default function AdCarousel({ ads }: AdCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, 10000); // 10 seconds per ad (2x slower)

    return () => clearInterval(timer);
  }, [ads.length, isPaused]);

  const ad = ads[index];
  const styles = ad.styles || {};
  const bgColor = styles.bg_color || '#1e40af';
  const textColor = styles.text_color || '#ffffff';

  const href = ad.promo_code 
    ? `${ad.cta_link}${ad.cta_link.includes('?') ? '&' : '?'}promo=${ad.promo_code}`
    : ad.cta_link;

  return (
    <Link 
      href={href}
      className="relative block w-full h-10 overflow-hidden z-50 transition-colors duration-500 group/banner"
      style={{ backgroundColor: bgColor }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={ad.id}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute inset-0 flex items-center justify-center gap-4 px-4 text-center text-sm font-medium"
          style={{ color: textColor }}
        >
          <span className="truncate max-w-[70vw]">
            <strong>{ad.title}</strong>
            {ad.description && <span className="hidden sm:inline mx-2 opacity-90">- {ad.description}</span>}
          </span>
          <div 
            className="flex-shrink-0 px-3 py-1 rounded-full bg-white/20 group-hover/banner:bg-white/30 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            {ad.cta_text || 'Learn More'}
          </div>
        </motion.div>
      </AnimatePresence>
    </Link>
  );
}
