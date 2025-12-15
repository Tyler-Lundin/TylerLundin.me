"use client";

import { motion } from "framer-motion";

export default function ContactCTA() {
  return (
    <section aria-label="Availability" className="relative z-10 mx-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.35 }}
      >
        <a href="/contact" className="group block">
          <div className="mx-auto max-w-3xl">
            <div
              className="relative overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800/60
                         bg-white/90 dark:bg-neutral-900/60 backdrop-blur px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]
                         transition-colors group-hover:border-neutral-300 dark:group-hover:border-neutral-700 sm:px-5 sm:py-5 md:px-6 md:py-6"
            >
              {/* subtle sheen / depth */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(0,0,0,0.05),transparent_45%)] dark:bg-[radial-gradient(900px_circle_at_20%_0%,rgba(255,255,255,0.08),transparent_45%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_85%_70%,rgba(16,185,129,0.10),transparent_50%)] dark:bg-[radial-gradient(700px_circle_at_85%_70%,rgba(16,185,129,0.12),transparent_50%)]" />
              </div>

              <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                {/* Left Text */}
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-600 dark:text-neutral-400">
                    Availability
                  </p>

                  {/* removed “1–2” promise */}
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 sm:text-lg">
                    Now booking new web projects
                  </h2>

                  {/* ensure true em dash */}
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 sm:text-sm">
                    Based in Spokane, WA — remote-friendly. Fast, clean builds for businesses
                    that want results, not fluff.
                  </p>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-center gap-2 sm:items-end sm:gap-3">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end">
                    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium
                                    border-emerald-600/30 bg-emerald-50 text-emerald-700
                                    dark:border-emerald-400/35 dark:bg-emerald-950/45 dark:text-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      Accepting clients
                    </span>

                    {/* removed Kickoff + duplicate Spokane pill */}
                  </div>

                  {/* CTA "button" */}
                  <span
                    className="inline-flex items-center rounded-full px-4 py-2 text-sm flex font-black shadow-sm whitespace-nowrap gap-3
                               bg-neutral-900 text-white dark:bg-white dark:text-neutral-950
                               transition-transform group-hover:translate-x-[1px]
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70 dark:focus-visible:ring-white/70
                               focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 sm:text-sm"
                  >
                    Start a Project
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </a>
      </motion.div>
    </section>
  );
}
