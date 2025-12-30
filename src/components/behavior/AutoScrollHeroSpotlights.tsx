"use client";

import { useEffect, useRef } from "react";

// Key used to persist user opt-out after cancel
const DISABLE_KEY = "autoscroll.spotlights.disabled";

// Easing function for a gentle, very slow scroll
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default function AutoScrollHeroSpotlights({
  targetId = "hero-spotlights",
  durationMs = 8000,
  startDelayMs = 400,
}: {
  targetId?: string;
  durationMs?: number;
  startDelayMs?: number;
}) {
  const animRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect user preferences and skip in cases where autoscroll is undesirable
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    if (window.location.hash) return; // skip if landing on a specific anchor

    // Persisted opt-out after first cancel
    try {
      if (localStorage.getItem(DISABLE_KEY) === "1") return;
    } catch {}

    const startAutoScroll = () => {
      const el = document.getElementById(targetId);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const startY = window.scrollY || window.pageYOffset;
      const targetCenter = (rect.top + window.pageYOffset) + rect.height / 2;
      const finalY = Math.max(0, Math.round(targetCenter - window.innerHeight / 2));

      if (Math.abs(finalY - startY) < 8) return; // already centered-ish

      const startTime = performance.now();

      const step = (now: number) => {
        if (cancelledRef.current) return;
        const t = Math.min(1, (now - startTime) / Math.max(1, durationMs));
        const eased = easeInOutQuad(t);
        const nextY = Math.round(startY + (finalY - startY) * eased);
        window.scrollTo({ top: nextY, behavior: "auto" });
        if (t < 1) {
          animRef.current = requestAnimationFrame(step);
        }
      };

      animRef.current = requestAnimationFrame(step);
    };

    // Detect user intention to override scrolling and cancel + persist disable
    const cancelAndDisable = () => {
      if (cancelledRef.current) return;
      cancelledRef.current = true;
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
      try {
        localStorage.setItem(DISABLE_KEY, "1");
      } catch {}
      cleanupListeners();
    };

    const onWheel = () => cancelAndDisable();
    const onTouchStart = () => cancelAndDisable();
    const onKeyDown = (e: KeyboardEvent) => {
      const keys = [
        "ArrowDown",
        "ArrowUp",
        "Space",
        "PageDown",
        "PageUp",
        "Home",
        "End",
      ];
      if (keys.includes(e.key)) cancelAndDisable();
    };

    const addListeners = () => {
      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("keydown", onKeyDown, { passive: true as any });
    };

    const cleanupListeners = () => {
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("touchstart", onTouchStart as any);
      window.removeEventListener("keydown", onKeyDown as any);
    };

    addListeners();

    // Wait until Greeting overlay is closed before attempting to scroll
    let observer: MutationObserver | null = null;

    const waitForGreetingClosed = () => new Promise<void>((resolve) => {
      // If user already dismissed previously, don't wait
      try {
        if (localStorage.getItem("greetingDismissed") === "1") return resolve();
      } catch {}

      const selector = '[aria-label="Intro greeting"]';
      const current = document.querySelector(selector);
      if (!current) return resolve();

      observer = new MutationObserver(() => {
        if (!document.querySelector(selector)) {
          resolve();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });

    // Slight delay to allow layout to settle, then await greeting closure, then scroll
    const schedule = (cb: () => void) => {
      // Prefer idle callback to avoid contention with first paint
      // @ts-ignore
      if (window.requestIdleCallback) {
        // @ts-ignore
        return window.requestIdleCallback(cb, { timeout: Math.max(1000, startDelayMs + 600) })
      }
      return window.setTimeout(cb, Math.max(0, startDelayMs + 600))
    }
    const startId: any = schedule(async () => {
      if (cancelledRef.current) return;
      await waitForGreetingClosed();
      if (!cancelledRef.current) startAutoScroll();
    });

    return () => {
      cancelledRef.current = true;
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
      try { (window as any).cancelIdleCallback?.(startId) } catch {}
      try { window.clearTimeout(startId as any) } catch {}
      if (observer) observer.disconnect();
      cleanupListeners();
    };
  }, [targetId, durationMs, startDelayMs]);

  return null;
}
