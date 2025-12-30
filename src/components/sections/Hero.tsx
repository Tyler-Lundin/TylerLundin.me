"use client";

import Image from 'next/image';
import dynamic from 'next/dynamic'
import type { Project } from '@/types/projects';
import { bundles } from '@/services';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Code-split heavy spotlights; mount after idle
const SpotlightProjects = dynamic(() => import('../projects/SpotlightProjects'))
const SpotlightBundles = dynamic(() => import('../bundles/SpotlightBundles'))

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
  const [showSpotlights, setShowSpotlights] = useState(false)

  // Auto-rotate between hero types every ~20s
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev === 'bundles' ? 'projects' : 'bundles'))
    }, 20000)
    return () => clearInterval(id)
  }, [])

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
      try { (window as any).cancelIdleCallback?.(id) } catch {}
      try { window.clearTimeout(id as any) } catch {}
    }
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
        <div
          id="hero-spotlights"
          className=""
        >
          {!showSpotlights ? (
            // Maintain space to avoid CLS while we defer mounting
            <div className="mx-auto max-w-5xl px-4 pb-12">
              <div className="relative h-[550px] sm:h-[650px] md:h-[750px] w-full max-w-[600px] mx-auto rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            </div>
          ) : (
            <>
              {current === "bundles" ? (
                <SpotlightBundles bundles={bundles} />
              ) : (
                <SpotlightProjects projects={projects} />
              )}
            </>
          )}
        </div>
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
      <div
        className="mb-3 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3"
      >
        <Link href="/about" className="md:absolute md:top-0 md:-left-4 relative block h-10 w-10 overflow-hidden rounded-full border border-black/20 dark:border-white/20">
          <Image
            src="/images/tyler.png"
            alt="Tyler"
            width={40}
            height={40}
            sizes="40px"
            className="pointer-events-none select-none object-cover"
            priority
          />
        </Link>

        <Link href="/spokane-web-developer" className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400 sm:text-[11px] hover:underline">
          Freelance Web Developer
        </Link>
      </div>

      {/* Name */}
      <h1
        className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl"
      >
        Tyler Lundin
      </h1>

      {/* Tagline */}
      <p
        className="mt-3 text-sm text-neutral-700 dark:text-neutral-300 sm:text-base"
      >
        {current === "bundles" && ("Bundles built for your needs. Take a look.") }
        {current === "projects" && ("Building fast, clean, modern websites. Take a look.")}
        
      </p>

      <Arrow />
    </div>
  );
};
