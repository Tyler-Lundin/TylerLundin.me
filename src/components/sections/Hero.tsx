"use client";

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import SpotlightProjects from '../projects/SpotlightProjects';
import type { Project } from '@/types/projects';
import SpotlightBundles from '../bundles/SpotlightBundles';
import { bundles } from '@/services';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type HeroProps = {
  projects?: Project[];
};


type HeroTypes = "bundles" | "projects"



const [on, off ] = [true, false]
const DE = (i:number) => (off ? i : 0)
const BUG = {
  root: DE(1),
  content: DE(1),
}

export function Hero({ projects }: HeroProps) {

  const [current, setCurrent] = useState<HeroTypes>("bundles")

  // Auto-rotate between hero types every ~20s
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev === 'bundles' ? 'projects' : 'bundles'))
    }, 20000)
    return () => clearInterval(id)
  }, [])


  return (
    <section
      id="hero"
      className={["relative overflow-visible py-8 overflow-hidden",
        BUG.root && "border border-red-400"
      ].join(" ")}
    >
      <div className={["relative z-10 mx-auto max-w-7xl px-4 grid gap-16",
        BUG.content && "border border-green-400"
      ].join(" ")}>
        {/* Compact intro above the showcase */}
        <Heading {...{current}}/>

        {/* Showcase: spotlight format */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className=""
        >
          <AnimatePresence mode="wait" initial={false}>
            {current === "bundles" && (
              <motion.div
                key="bundles"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <SpotlightBundles bundles={bundles} />
              </motion.div>
            )}
            {current === "projects" && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <SpotlightProjects projects={projects} />
              </motion.div>
            )}
          </AnimatePresence>
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

const Heading = ({current}:{current:HeroTypes}) => {
  return (
    <div className="relative mx-auto max-w-xl text-center w-fit">
      {/* Avatar + Label */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-3 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3"
      >
        <Link href="/about" className="md:absolute md:top-0 md:-left-4 relative block h-10 w-10 overflow-hidden rounded-full border border-black/20 dark:border-white/20">
          <Image
            src="/images/tyler.png"
            alt="Tyler"
            fill
            className="pointer-events-none select-none object-cover"
            priority
          />
        </Link>

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
        {current === "bundles" && ("Bundles built for your needs. Take a look.") }
        {current === "projects" && ("Building fast, clean, modern websites. Take a look.")}
        
      </motion.p>

      <Arrow />
    </div>
  );
};
