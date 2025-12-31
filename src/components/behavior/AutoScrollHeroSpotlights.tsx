"use client";

import { useEffect, useRef } from "react";

// Easing function for a gentle, very slow scroll
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default function AutoScrollHeroSpotlights({
  targetId = "hero-spotlights",
  durationMs = 8000,
  startDelayMs = 3000,
}: {
  targetId?: string;
  durationMs?: number;
  startDelayMs?: number;
}) {
  const animRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const resizeTimerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const roRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect user preferences and skip in cases where autoscroll is undesirable
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    if (window.location.hash) return; // skip if landing on a specific anchor

    const getTargetY = () => {
      const el = document.getElementById(targetId);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const targetCenter = rect.top + window.pageYOffset + rect.height / 2;
      return Math.max(0, Math.round(targetCenter - window.innerHeight / 2));
    };

    const startAutoScroll = () => {
      const finalY = getTargetY();
      if (finalY == null) return;
      const startY = window.scrollY || window.pageYOffset;
      if (Math.abs(finalY - startY) < 8) return; // already centered-ish

      cancelledRef.current = false;
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

    const clearAnim = () => {
      cancelledRef.current = true;
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
      animRef.current = null;
    };

    const scheduleCheck = () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        const finalY = getTargetY();
        if (finalY == null) return;
        const currentY = window.scrollY || window.pageYOffset;
        const tolerance = 8;
        // If above target, begin scroll. If below/equal, do nothing (disabled)
        if (currentY + tolerance < finalY) {
          startAutoScroll();
        }
      }, Math.max(0, startDelayMs));
    };

    // Initial schedule on load
    scheduleCheck();

    // User intent: reset and re-check on user scroll interactions
    const onWheel = () => { clearAnim(); scheduleCheck(); };
    const onTouchStart = () => { clearAnim(); scheduleCheck(); };
    const onKeyDown = (e: KeyboardEvent) => {
      const keys = ["ArrowDown","ArrowUp","Space","PageDown","PageUp","Home","End"];
      if (keys.includes(e.key)) { clearAnim(); scheduleCheck(); }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("keydown", onKeyDown, { passive: true as any });

    // Also re-check after resizes
    const onResize = () => {
      if (resizeTimerRef.current != null) window.clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = window.setTimeout(() => {
        clearAnim();
        scheduleCheck();
      }, 150);
    };
    window.addEventListener("resize", onResize, { passive: true as any });

    // Re-evaluate when the target resizes (e.g., after lazy content mounts)
    const targetEl = document.getElementById(targetId);
    if ('ResizeObserver' in window && targetEl) {
      roRef.current = new ResizeObserver(() => {
        clearAnim();
        scheduleCheck();
      });
      roRef.current.observe(targetEl);
    }

    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      if (resizeTimerRef.current != null) window.clearTimeout(resizeTimerRef.current);
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("touchstart", onTouchStart as any);
      window.removeEventListener("keydown", onKeyDown as any);
      window.removeEventListener("resize", onResize as any);
      try { roRef.current?.disconnect() } catch {}
      clearAnim();
    };
  }, [targetId, durationMs, startDelayMs]);

  return null;
}
