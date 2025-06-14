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
            className="w-fit px-8 py-2 border-[1px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-pink-950/50 border-black/50 dark:border-white/50 rounded-[8px] flex items-center gap-2"
          >
            Let&apos;s Build Something
            <ArrowRightIcon className="w-4 h-4 mt-[2px]" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}




