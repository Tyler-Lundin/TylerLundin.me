'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ParallaxBackground() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const rafId = useRef<number | undefined>(undefined);

  const handleScroll = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    rafId.current = requestAnimationFrame(() => {
      setScrollPosition(window.scrollY);
    });
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 -z-10 bg-white"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white z-50 dark:invert" />
      <Image
        style={{
          transform: `translateY(${scrollPosition * 0.05}px)`,
          willChange: 'transform',
        }}
        src="/images/landing-page/hero-bg.jpg"
        alt="Hero Background"
        fill
        className="object-cover absolute inset-0 invert grayscale dark:invert-0 opacity-75"
      />
    </motion.div>
  );
} 