"use client";

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

type OrbitingBubblesProps = {
  radius?: number; // px from center; if not provided, uses responsive defaults
  count?: number;
  durationSec?: number; // base orbit duration
  enterDelaySec?: number;
};

export default function OrbitingBubbles({
  radius,
  count = 3,
  durationSec = 24,
  enterDelaySec = 0.2,
}: OrbitingBubblesProps) {
  const [popped, setPopped] = useState<boolean[]>(() => Array.from({ length: count }, () => false));
  const [responsiveRadius, setResponsiveRadius] = useState<number>(() => {
    if (typeof window === 'undefined') return 150;
    const w = window.innerWidth;
    if (w >= 1024) return 190; // lg+
    if (w >= 640) return 160; // sm–md
    return 130; // base
  });

  useEffect(() => {
    if (radius != null) return; // explicit prop wins
    const onResize = () => {
      const w = window.innerWidth;
      setResponsiveRadius(w >= 1024 ? 190 : w >= 640 ? 160 : 130);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [radius]);

  const angles = useMemo(() => {
    // Stagger starting angles
    return Array.from({ length: count }, (_, i) => (i / count) * 360);
  }, [count]);

  const sizes = useMemo(() => {
    // Slightly varied sizes
    const base = [16, 24, 32];
    return Array.from({ length: count }, (_, i) => base[i % base.length]);
  }, [count]);

  const durations = useMemo(() => {
    // Slightly varied durations for a more organic feel
    return Array.from({ length: count }, (_, i) => durationSec * (1 + i * 0.2));
  }, [count, durationSec]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: enterDelaySec, ease: 'easeOut' }}
    >
      {angles.map((angle, i) => {
        const size = sizes[i];
        const dur = durations[i];
        const isPopped = popped[i];
        const r = radius ?? responsiveRadius;

        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ width: 0, height: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: 'linear', duration: dur }}
            initial={{ rotate: angle }}
          >
            <motion.button
              type="button"
              aria-label="Decorative bubble"
              className="pointer-events-auto relative"
              style={{
                transform: `translate(calc(${r}px), -50%)`,
                width: size,
                height: size,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setPopped((prev) => {
                  const next = prev.slice();
                  next[i] = true;
                  return next;
                });
              }}
            >
              {/* bubble */}
              <motion.span
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-sky-400/40 to-cyan-300/30 supports-[backdrop-filter]:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/30 shadow-[0_0_18px_rgba(56,189,248,0.25)]"
                style={{ width: size, height: size, left: '0%', top: '50%' }}
                animate={isPopped ? { scale: 0.6, opacity: 0 } : { scale: [1, 1.06, 1], opacity: 1 }}
                transition={{ duration: isPopped ? 0.28 : 3.2, repeat: isPopped ? 0 : Infinity, ease: 'easeInOut' }}
              />

              {/* pop ripple */}
              {isPopped && (
                <motion.span
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/60"
                  style={{ width: size, height: size, left: '0%', top: '50%' }}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.1, opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />
              )}
            </motion.button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
