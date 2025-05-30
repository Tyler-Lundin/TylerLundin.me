"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const ROLES = [
  'Web Development',
  'Bodybuilding',
  'Game Development',
  '3D Printing & CAD',
  'Off-Roading',
  'Hiking',
  'Custom PC Building',
  'Video Editing & Photography',
];

export function Hero() {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentRoleIndex((prev) => (prev + 1) % ROLES.length);
        setIsTransitioning(false);
      }, 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-4rem)] flex flex-col justify-center relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 animate-gradient" />

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
        <div className="backdrop-blur-sm bg-gradient-to-bl from-white/10 to-white/50 dark:from-black/10 dark:to-black/50 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl p-8 sm:p-12 max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Profile and Role Section */}
            
              {/* Profile Image with Glass Effect */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 dark:border-white/10 backdrop-blur-sm">
                  <Image
                    src="/images/tyler.png"
                    alt="Tyler"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Role Text with Glass Effect */}
              <motion.div
                className="text-center bg-white/50 dark:bg-black/50 overflow-hidden rounded-lg px-4 backdrop-blur-sm sm:text-left self-center mx-auto">
                <h2 className="text-2xl font-light text-neutral-800 dark:text-neutral-200 tracking-tight">
                  <span className="font-thin lowercase">
                    <span className={`inline-block whitespace-nowrap transition-all duration-1000 ease-in-out transform ${
                      isTransitioning 
                        ? 'opacity-0 translate-y-8' 
                        : 'opacity-100 translate-y-0'
                    }`}>
                      {ROLES[currentRoleIndex]}
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl -z-10" />
                    </span>
                  </span>
                </h2>
              </motion.div>


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
                className="px-8 py-3.5 rounded-xl backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 text-neutral-800 dark:text-neutral-200 text-base font-medium hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                View My Projects
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 text-neutral-800 dark:text-neutral-200 text-base font-medium hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
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


