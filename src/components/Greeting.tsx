"use client";

import { X } from "lucide-react";
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

    const timer = window.setTimeout(() => setVisible(true), 1800);
    return () => window.clearTimeout(timer);
  }, [mounted]);

  const close = () => {
    setVisible(false);
    try {
      window.localStorage.setItem("greetingDismissed", "1");
    } catch {
      // ignore
    }
    window.setTimeout(() => setDismissed(true), 220);
  };

  if (!mounted || dismissed) return null;

  return (
    <GreetingOverlay onClose={close}>
      <GreetingCard visible={visible} onClose={close} />
    </GreetingOverlay>
  );
}

/* --- Subcomponents --- */

function GreetingOverlay({ children, onClose }: { children: React.ReactNode, onClose:()=>void }) {
  return (
    <div
      aria-label="Intro greeting"
      aria-live="polite"
      onClick={onClose}
      className={`
        fixed inset-0 z-[500]
        flex items-center justify-center
        backdrop-blur-[4px]
        bg-white/45 dark:bg-black/45
      `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
}

function GreetingCard({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`
        pointer-events-auto relative
        w-[min(92vw,420px)]
        sm:w-[380px]
        md:w-[400px]
        min-h-[420px]
        overflow-hidden rounded-md
        border-8 border-neutral-200/80 dark:border-neutral-700/80
        bg-white/95 dark:bg-neutral-900/95
        shadow-lg backdrop-blur-md
        transform transition-all duration-300
        ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}
      `}
    >
      <CloseButton onClick={onClose} />

      <div className="grid items-start gap-4 p-4 sm:p-5">
        <GreetingBody onClose={onClose} />
        <StickerAccent />
      </div>
    </div>
  );
}

function GreetingBody({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative z-10 min-w-0 flex-1">
      <p className="text-[11px] sm:text-xs leading-snug text-neutral-700 dark:text-neutral-200 space-y-2.5">
        <span className="block font-semibold tracking-[0.08em] uppercase">
          I build what you actually need for a realistic price.
        </span>

        <span className="block italic tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400">
          Agencies quoting you $3,000+?
        </span>

        <span className="inline-block font-black italic tracking-[0.18em] uppercase bg-red-700 text-white text-[10px] sm:text-[11px] text-center px-3 py-1 rounded-sm">
          F*ck That!
        </span>

        <span className="block pt-1.5 space-y-0.5">
          <span className="block font-extrabold text-[12px] sm:text-sm">
            $499 down
          </span>
          <span className="block font-semibold uppercase tracking-[0.14em]">
            First month free
          </span>
          <span className="block font-semibold text-[11px] sm:text-xs">
            $49.99 / month after your 1-month trial — cancel anytime.
          </span>
        </span>
      </p>

      <div className="mt-3.5 grid gap-2 justify-start">
        <Link
          href="/projects"
          onClick={onClose}
          className={`
            inline-flex items-center justify-center rounded-full
            px-3.5 py-1.75 text-[11px] sm:text-xs font-medium
            bg-neutral-900 text-white hover:bg-neutral-800
            dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200
            transition-transform duration-150 active:scale-95
          `}
        >
          View projects
        </Link>
        <Link
          href="/contact"
          onClick={onClose}
          className={`
            inline-flex items-center justify-center rounded-full
            px-3.5 py-1.75 text-[11px] sm:text-xs font-medium
            bg-neutral-900 text-white hover:bg-neutral-800
            dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200
            transition-transform duration-150 active:scale-95
          `}
        >
          Message Me
        </Link>
      </div>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Dismiss greeting"
      className={`
        absolute top-2 left-2
        grid h-3 w-3 place-content-center
        rounded-full border border-black 
        bg-red-400 dark:bg-red-500
        group
      `}
    >
      <X
        size={10}
        className="opacity-0 group-hover:opacity-100 text-black  transition-opacity"
      />
    </button>
  );
}

function StickerAccent() {
  return (
    <div className="pointer-events-none absolute -bottom-6 -right-4 sm:-bottom-4 sm:-right-3 opacity-80">
      <StickerTyler
        size={5}
        sticker="prepared"
        className="scale-x-[-1]"
      />
    </div>
  );
}

