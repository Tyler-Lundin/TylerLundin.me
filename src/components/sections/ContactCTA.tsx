"use client";

import { motion } from 'framer-motion';

export default function ContactCTA() {
  return (
    <section aria-label="Availability" className="relative z-10">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="mt-6"
        >
          <a
            href="/contact"
            className="group block rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur px-4 py-4 sm:px-6 sm:py-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[15px] sm:text-base text-neutral-900 dark:text-neutral-100">
                <span className="font-semibold">Now booking</span>
                <span className="mx-2 opacity-60">•</span>
                <span>Based in Spokane, WA</span>
                <span className="mx-2 opacity-60 hidden sm:inline">•</span>
                <span className="opacity-90">Kickoff in 1–2 weeks</span>
              </div>
              <span className="inline-flex w-fit items-center gap-2 text-sm font-medium rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-1.5">
                Start a project
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
