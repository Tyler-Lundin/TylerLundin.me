"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aboutConfig } from "@/config/about";

type Stat = {
  label: string;
  value?: string;          // can be "7–14 days", "<24 hrs", "More calls", etc
  helperText?: string;     // optional detail
  type?: "metric" | "included"; // included = no number needed
};

export default function StatsDrawer() {
  const raw = (aboutConfig.stats ?? []) as Stat[];
  const stats = useMemo(() => raw.filter(s => s?.label), [raw]);

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!open) return;
      const el = panelRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown as any);
    };
  }, [open]);

  if (!stats.length) return null;

  const isOpen = open;

  return (
    <div className="fixed right-0 top-[22vh] z-[100] select-none">
      <div className="flex items-stretch justify-end" ref={panelRef}>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.aside
              key="stats"
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="pointer-events-auto"
              aria-label="Quick stats"
            >
              <div className="w-[18rem] sm:w-[20rem] rounded-l-2xl rounded-br-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-black/75 backdrop-blur px-3 py-3 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Quick facts
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    aria-label="Close stats"
                  >
                    Esc
                  </button>
                </div>

                <ul className="grid gap-2">
                  {stats.map((s) => {
                    const kind = s.type ?? (s.value ? "metric" : "included");
                    return (
                      <li
                        key={s.label}
                        className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[12px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
                              {s.label}
                            </div>
                            {s.helperText ? (
                              <div className="mt-0.5 text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
                                {s.helperText}
                              </div>
                            ) : null}
                          </div>

                          <div className="shrink-0 text-right">
                            {kind === "metric" ? (
                              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {s.value}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2 py-0.5 text-[11px] text-neutral-800 dark:text-neutral-200">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-900/60 dark:bg-white/60" />
                                Included
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <button
          type="button"
          aria-label={isOpen ? "Hide quick stats" : "Show quick stats"}
          aria-expanded={isOpen}
          className={`pointer-events-auto group ${isOpen ? "rounded-none" : "rounded-l-md "} h-fit transition-all border border-black/10 dark:border-white/15 bg-yellow-400/90 dark:bg-yellow-400/90 backdrop-blur px-2 py-2 shadow-md hover:shadow-lg text-neutral-900 `}
          onClick={() => setOpen((v) => !v)}
        >
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="block"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M8 21h8M12 17a6 6 0 0 1-6-6V3h12v8a6 6 0 0 1-6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 5h3a3 3 0 0 1-3 3M6 5H3a3 3 0 0 0 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.span>
        </button>
      </div>
    </div>
  );
}

