"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';

export function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden"
    >
      {/* Content container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Profile Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-64 h-64 mx-auto mb-8"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden border border-black/25 dark:border-white/25 backdrop-blur-sm">
            <Image
              src="/images/tyler.png"
              alt="Tyler"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

        {/* Name and Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
            Tyler Lundin
          </h1>
          <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-300 font-medium">
            Freelance Web Developer
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Link
            href="/contact"
            className="group w-full justify-center px-8 py-2 border-[1px] bg-gradient-to-r from-emerald-500/50 via-cyan-500/50 to-blue-500/50 dark:from-emerald-900/50 dark:via-cyan-900/50 dark:to-blue-900/50 border-black/50 dark:border-white/50 rounded-[8px] flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/20 active:scale-[0.98] hover:bg-gradient-to-r hover:from-emerald-600/50 hover:via-cyan-600/50 hover:to-blue-600/50 dark:hover:from-emerald-800/50 dark:hover:via-cyan-800/50 dark:hover:to-blue-800/50"
          >
            <span className="transition-all duration-300 group-hover:-translate-x-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">Let&apos;s Build Something</span>
            <ArrowRightIcon className="w-4 h-4 mt-[2px] transition-all duration-300 group-hover:translate-x-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}




