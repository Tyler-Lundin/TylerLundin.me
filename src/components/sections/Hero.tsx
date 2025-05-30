"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import TerminalBanner from '../TerminalBanner';
export function Hero() {


  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-4rem)] flex flex-col justify-center relative overflow-hidden"
    >
      {/* Animated background gradient */}

      {/* Glass morphism container */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10 mx-auto px-4 sm:px-6 lg:px-16 w-full max-w-7xl flex transition-all duration-300 ease-in-out">
        <div className="backdrop-blur-sm border py-16 border-black/25 dark:border-white/25 bg-gradient-to-bl w-full from-white/10 to-white/50 dark:from-black/10 dark:to-black/50 rounded-3xl shadow-2xl p-4 sm:p-8 md:p-12 max-w-md mx-auto">
          <span className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-3 bg-black rounded-full"/>
          <div className="space-y-8">
            {/* Profile and Role Section */}
            
              {/* Profile Image with Glass Effect */}
              <div className="relative w-40 h-40 mx-auto ">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
                <div className="relative w-full h-full rounded-full overflow-hidden border border-black/25 dark:border-white/25 backdrop-blur-sm">
                  <Image
                    src="/images/tyler.png"
                    alt="Tyler"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <TerminalBanner />


            {/* Name with Glass Effect */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight text-center">
              <span className="relative">
                Tyler Lundin
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl -z-10" />
              </span>
            </h1>

            {/* Buttons with Glass Effect */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
              <Link
                href="/projects"
                className="p-2 rounded-xl text-center backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-black/25 dark:border-white/10 text-neutral-800 dark:text-neutral-200 text-base font-medium hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                View My Projects
              </Link>
              <Link
                href="/contact"
                className="p-2 rounded-xl text-center backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-black/25 dark:border-white/5 text-neutral-800 dark:text-neutral-200 text-base font-medium hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}


