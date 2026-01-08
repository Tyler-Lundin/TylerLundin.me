"use client";

import Image from 'next/image';
import type { Project } from '@/types/projects';
import { bundles } from '@/services';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sora } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion"; // Added for smooth transitions

const sora = Sora({ subsets: ["latin"], display: "swap" });

// Import spotlights directly; we still defer mounting via `showSpotlights`
import SpotlightProjects from '../projects/SpotlightProjects'
import SpotlightBundles from '../bundles/SpotlightBundles'

type HeroProps = {
  projects?: Project[];
};

type HeroTypes = "bundles" | "projects"

const [on, off] = [true, false]
const DE = (i: number) => (off ? i : 0)
const BUG = {
  root: DE(1),
  content: DE(1),
}

export function Hero({ projects }: HeroProps) {

  const [current, setCurrent] = useState<HeroTypes>("projects")
  const [showSpotlights, setShowSpotlights] = useState(false)

  // REMOVED: The auto-rotate setInterval is gone.

  // Mount heavy spotlights after idle or small delay to improve LCP
  useEffect(() => {
    const schedule = (cb: () => void) => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.requestIdleCallback) {
        // @ts-ignore
        return window.requestIdleCallback(cb, { timeout: 2500 })
      }
      return window.setTimeout(cb, 1400)
    }
    const id = schedule(() => setShowSpotlights(true))
    return () => {
      try { (window as any).cancelIdleCallback?.(id) } catch { }
      try { window.clearTimeout(id as any) } catch { }
    }
  }, [])


  return (
    <section
      id="hero"
      className={["relative overflow-visible py-8 overflow-hidden",
        BUG.root && "border border-red-400"
      ].join(" ")}
    >
      <div className={["relative z-10 mx-auto max-w-7xl sm:px-4 grid gap-12", // Increased gap slightly for the toggle
        BUG.content && "border border-green-400"
      ].join(" ")}>
        
        {/* Intro + Controls */}
        <div className="flex flex-col items-center gap-6">
          <Heading {...{ current }} />
          <ViewToggle current={current} onChange={setCurrent} />
        </div>

        {/* Showcase: spotlight format */}
        <div
          id="hero-spotlights"
          className={[
            'relative',
            !showSpotlights ? 'min-h-[700px] sm:min-h-[820px] md:min-h-[900px]' : ''
          ].join(' ')}
        >
          {!showSpotlights ? (
            // Maintain space to avoid CLS while we defer mounting
            <div className="mx-auto max-w-5xl sm:px-4 pb-12">
              <div className="relative h-[550px] sm:h-[650px] md:h-[750px] w-full max-w-[600px] mx-auto rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            </div>
          ) : (
            <div className="relative w-full grid grid-cols-1">
              {/* Keep both mounted to avoid chunk loads/layout shifts; grid overlays and lets height auto-fit tallest */}
              <motion.div
                className="col-start-1 row-start-1"
                initial={false}
                animate={{ opacity: current === 'bundles' ? 1 : 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ pointerEvents: current === 'bundles' ? 'auto' : 'none' }}
              >
                <SpotlightBundles bundles={bundles} />
              </motion.div>
              <motion.div
                className="col-start-1 row-start-1"
                initial={false}
                animate={{ opacity: current === 'projects' ? 1 : 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ pointerEvents: current === 'projects' ? 'auto' : 'none' }}
              >
                <SpotlightProjects projects={projects} />
              </motion.div>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}

// --- New Luxury Toggle Component ---
const ViewToggle = ({ current, onChange }: { current: HeroTypes, onChange: (v: HeroTypes) => void }) => {
  return (
    <div className="relative flex p-1 bg-neutral-100 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/10">
      <button
        onClick={() => onChange("bundles")}
        className={`relative z-10 px-6 py-1.5 text-sm font-semibold transition-colors duration-200 rounded-full ${
          current === "bundles" ? "text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
        }`}
      >
        Bundles
      </button>
      <button
        onClick={() => onChange("projects")}
        className={`relative z-10 px-6 py-1.5 text-sm font-semibold transition-colors duration-200 rounded-full ${
          current === "projects" ? "text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
        }`}
      >
        Projects
      </button>
      
      {/* Sliding Background Pill */}
      <div className="absolute inset-0 p-1 pointer-events-none">
        <motion.div
          layout
          className="h-full w-[calc(50%)] bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-black/5 dark:border-white/5"
          initial={false}
          animate={{ x: current === "bundles" ? "0%" : "100%" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  )
}

const Arrow = () => {
  return (
    <Image
      src="/images/arrow.png"
      alt="Down arrow"
      width={88}
      height={88}
      className="absolute dark:invert right-0 translate-x-full top-full invisible md:visible opacity-90 select-none pointer-events-none rotate-45"
      aria-hidden
      priority
    />
  )
}

const Heading = ({ current }: { current: HeroTypes }) => {
  return (
    <div className="relative mx-auto max-w-[90vw] sm:max-w-xl text-center w-fit">
      {/* Avatar + Label */}
      <div
        className="mb-3 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3"
      >
        <Link 
          href="/about" 
          className="md:absolute md:top-0 md:-left-2 md:-translate-x-full relative block h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full border border-black/20 dark:border-white/20"
        >
          <Image
            src="/images/tyler.png"
            alt="Tyler"
            width={80}
            height={80}
            sizes="(max-width: 640px) 48px, 56px"
            className="pointer-events-none select-none object-cover"
            priority
          />
        </Link>

        <Link 
          href="/spokane-web-developer" 
          className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-neutral-600 dark:text-neutral-400 hover:underline"
        >
          Freelance Web Developer
        </Link>
      </div>

      {/* Name */}
      <h1
        style={{ ...sora.style }}
        className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-100"
      >
        Tyler Lundin
      </h1>


      {/* Tagline */}
      <p
        style={{ ...sora.style }}
        className="mt-2 sm:mt-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 sm:text-base absolute left-1/2 -translate-x-1/2 w-full max-w-[95%] whitespace-normal sm:whitespace-nowrap"
      >
        {current === "bundles" && ("Websites built for your needs. Take a look.")}
        {current === "projects" && ("Building fast, modern websites. Take a look.")}
      </p>

      {/* Spacer */}
      <div className="h-12" />

      {/* CTA Button */}
      <div className="flex justify-center mt-4">
        <Link 
          href="/start-now?promo=FREEFIRST"
          className="group relative inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Start Your Project</span>
          <svg className="size-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-black"></span>
          </div>
        </Link>
      </div>

      {/* Spacer - Adjusted width to not force scroll on tiny screens */}
      <div className="w-64 sm:w-80 h-2" />
      
      <Arrow />
    </div>
  );
};
