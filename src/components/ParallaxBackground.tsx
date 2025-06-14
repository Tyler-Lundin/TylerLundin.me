'use client';

import { useEffect, useCallback, useRef } from 'react';
import AnimatedBackground from './AnimatedBackground';

export default function ParallaxBackground() {
  const spanRef = useRef<HTMLSpanElement>(null);
  const rafId = useRef<number | undefined>(undefined);

  const handleScroll = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const offset = window.scrollY * 0.1;
      if (spanRef.current) {
        spanRef.current.style.transform = `translateY(${offset}px)`;
      }
    });
  }, []);

  useEffect(() => {
    handleScroll(); // Initial position
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  return (
    <div 
      className="fixed inset-0 -z-10"
    >
      <span
      className="absolute inset-0 -z-10 bg-white dark:bg-black"
      ref={spanRef}
      >
      <AnimatedBackground />
      <VerticalBuffer />
      <VerticalGradient />
      <HorizontalGradient />
      </span>
    </div>
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

function VerticalBuffer() {
  return (
    <>
    <div className="absolute top-0 left-0 w-screen h-screen -translate-y-full bg-white dark:bg-black" />
    <div className="absolute bottom-0 left-0 w-screen h-screen translate-y-full bg-white dark:bg-black" />
    </>
  );
}