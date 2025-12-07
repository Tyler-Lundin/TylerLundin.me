"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import SpotlightShowcase from './SpotlightShowcase';
import type { Project } from '@/types/projects';

type HeroProps = {
  projects?: Project[];
};

export function Hero({ projects }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative overflow-visible"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 sm:pt-12 md:pt-16">
        {/* Compact intro above the showcase */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-3 mb-3"
          >
            <span className="relative block w-10 h-10 rounded-full overflow-hidden border border-black/20 dark:border-white/20">
              <Image
                src="/images/tyler.png"
                alt="Tyler"
                fill
                className="object-cover select-none pointer-events-none"
                priority
              />
            </span>
            <span className="text-sm uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
              Freelance Web Developer
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight"
          >
            Tyler Lundin
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-2 text-base sm:text-lg text-neutral-700 dark:text-neutral-300"
          >
            Building fast, clean, modern websites. Take a look.
          </motion.p>
        </div>

        {/* Showcase: spotlight format */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-6 sm:mt-8 md:mt-10"
        >
          <SpotlightShowcase projects={projects} className="pt-0 pb-2" />
        </motion.div>
      </div>
    </section>
  );
}
