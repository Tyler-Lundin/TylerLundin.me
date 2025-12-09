"use client";

import { useState, useEffect } from "react";
import StickerTyler from "./StickerTyler";
import Link from "next/link";

export default function Greeting() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const wasDismissed =
      typeof window !== "undefined" &&
      window.localStorage.getItem("greetingDismissed") === "1";

    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Slide up after a short delay
    const timer = window.setTimeout(() => setVisible(true), 1800);

    return () => window.clearTimeout(timer);
  }, [mounted]);

  const close = () => {
    setVisible(false);
    try {
      window.localStorage.setItem("greetingDismissed", "1");
    } catch {}
    window.setTimeout(() => setDismissed(true), 220);
  };

  if (!mounted || dismissed) return null;

  return (
    <div
      aria-label="Intro greeting"
      aria-live="polite"
      className={`
        fixed bottom-3 left-0 right-0 z-[1000]
        flex justify-center
        sm:bottom-6 sm:right-6 sm:left-auto sm:justify-end
        pointer-events-none
      `}
    >
      <div
        className={`
          pointer-events-auto w-full max-w-sm sm:w-[340px]
          overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80
          bg-white/95 dark:bg-neutral-900/95 shadow-lg backdrop-blur-md
          transform transition-all duration-250
          ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"}
        `}
      >
        <div className="flex items-start gap-3 p-3.5">
          {/* Sticker avatar */}
          <div className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-neutral-900/5 dark:bg-white/5 flex items-center justify-center">
            <StickerTyler size={5} />
          </div>

          {/* Copy + CTA */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">
              Need a developer who actually ships?
            </p>
            <p className="mt-1 text-[11px] sm:text-xs leading-snug text-neutral-600 dark:text-neutral-300">
              I build fast, clean sites for small teams that want to look sharp
              without babysitting their stack.
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <Link
                href="/projects"
                onClick={close}
                className={`
                  inline-flex items-center justify-center rounded-full
                  px-3.5 py-1.5 text-[11px] sm:text-xs font-medium
                  bg-neutral-900 text-white hover:bg-neutral-800
                  dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200
                  transition-transform duration-150 active:scale-95
                `}
              >
                View projects
              </Link>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Dismiss greeting"
            className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/95 text-[11px] text-neutral-600 shadow-sm hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

