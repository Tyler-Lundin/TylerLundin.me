'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedBackground from './AnimatedBackground';

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
      className="fixed inset-0 -z-10"
    >
      <motion.span
      className="absolute inset-0 -z-10 bg-white dark:bg-black"
      initial={{ opacity: 0.5 }}
            style={{
              transform: `translateY(${scrollPosition * 0.1}px)`,
              willChange: 'transform',
            }}
      >
      <AnimatedBackground />
      <VerticalGradient />
      <HorizontalGradient />
      <Image
        src="/images/landing-page/hero-bg.jpg"
        alt="Hero Background"
        fill
        className="object-cover absolute inset-0 invert -z-20 grayscale animate-spin-zoom  dark:invert-0 opacity-75"
      />
      </motion.span>
    </motion.div>
  );
} 

function VerticalGradient() {
  return (
    <>
    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent z-50 dark:invert" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white z-50 dark:invert" />
    </>
  );
}

function HorizontalGradient() {
  return (
    <>
    <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent z-50 dark:invert" />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white z-50 dark:invert" />
    </>
  );
}