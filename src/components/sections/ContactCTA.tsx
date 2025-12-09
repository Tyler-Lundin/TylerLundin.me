"use client";

import { motion } from "framer-motion";

export default function ContactCTA() {
  return (
    <section
      aria-label="Availability"
      className="relative z-10 "
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.35 }}
      >
        <a href="/contact" className="group block">
          <div
            className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80 px-3 py-3 shadow-sm backdrop-blur
                       dark:border-neutral-700/70 dark:bg-neutral-900/80 sm:px-4 sm:py-4 md:px-6 md:py-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {/* Left Text */}
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  Availability
                </p>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 sm:text-lg">
                  Now booking 1–2 new web projects
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 sm:text-sm">
                  Based in Spokane, WA — remote-friendly. Fast, clean builds for
                  businesses that want results, not fluff.
                </p>
              </div>

              {/* Right Side */}
              <div className="flex flex-col items-center gap-2 sm:items-end sm:gap-3">
                {/* Status Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end">
                  {/* Primary pill always visible */}
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-950/60 dark:text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Accepting clients
                  </span>

                  {/* Secondary pills only from sm+ to avoid mobile clutter */}
                  <span className="hidden sm:inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    Kickoff: 1–2 weeks
                  </span>
                  <span className="hidden sm:inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    Spokane, WA
                  </span>
                </div>

                {/* CTA "button" */}
                <span
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white transition-transform
                             group-hover:translate-x-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2
                             focus-visible:ring-offset-white dark:bg-neutral-100 dark:text-neutral-900 dark:focus-visible:ring-neutral-100 dark:focus-visible:ring-offset-neutral-900
                             sm:text-sm sm:px-4 sm:py-2"
                >
                  Start a project
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    <path
                      d="M5 12h14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </a>
      </motion.div>
    </section>
  );
}

