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
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-12 sm:pt-12 md:pt-16">
        {/* Compact intro above the showcase */}
        <Heading />

        {/* Showcase: spotlight format */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="my-8 sm:my-10 md:my-12"
        >
          <SpotlightShowcase projects={projects} className="pt-0 pb-2" />
        </motion.div>
      </div>

    </section>
  );
}


const Arrow = () => {
  return (
      <Image
        src="/images/arrow.png"
        alt="Down arrow"
        width={88}
        height={88}
        className="absolute dark:invert -right-16 invisible md:visible -bottom-12 rotate-12 opacity-90 select-none pointer-events-none"
        aria-hidden
        priority
      />
  )
}

const Heading = () => {
  return (
    <div className="relative mx-auto max-w-xl text-center w-fit">
      {/* Avatar + Label */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-3 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3"
      >
        <span className="relative block h-10 w-10 overflow-hidden rounded-full border border-black/20 dark:border-white/20">
          <Image
            src="/images/tyler.png"
            alt="Tyler"
            fill
            className="pointer-events-none select-none object-cover"
            priority
          />
        </span>

        <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400 sm:text-[11px]">
          Freelance Web Developer
        </span>
      </motion.div>

      {/* Name */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl"
      >
        Tyler Lundin
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="mt-3 text-sm text-neutral-700 dark:text-neutral-300 sm:text-base"
      >
        Building fast, clean, modern websites. Take a look.
      </motion.p>

      <Arrow />
    </div>
  );
};

