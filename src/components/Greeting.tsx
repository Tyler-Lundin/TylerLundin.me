"use client";
import { useState, useEffect, useRef } from "react";
import StickerTyler from "./StickerTyler";

export default function Greeting() {
  // show: controls entrance/exit animations
  const [show, setShow] = useState(false);
  // active: controls whether the overlay is mounted at all
  const [active, setActive] = useState(true);
  const hideTimerRef = useRef<number | null>(null);

  // On mount: respect prior dismissal; otherwise kick off entrance animation
  useEffect(() => {
    const dismissed = typeof window !== "undefined" && localStorage.getItem("greetingDismissed") === "1";
    if (dismissed) {
      setActive(false);
      return;
    }
    const timer = window.setTimeout(() => setShow(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  // Close handler: trigger fade-out, then unmount after transition
  const close = () => {
    if (!active) return;
    setShow(false);
    try {
      localStorage.setItem("greetingDismissed", "1");
    } catch {}
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    // Match longest transition (container: 1400ms)
    hideTimerRef.current = window.setTimeout(() => {
      setActive(false);
    }, 1450);
  };

  // Key listener: Enter closes overlay
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  // If closed, render nothing
  if (!active) return null;

  return (
    <div
      aria-hidden
      onClick={close}
      className={`fixed inset-0 ${show ? "pointer-events-auto" : "pointer-events-none"} cursor-pointer flex items-center justify-center 
      bg-black/80 backdrop-blur-sm transition-opacity duration-[1400ms] ease-out z-[1000]
      ${show ? "opacity-100" : "opacity-0"}`}
    >
      {/* CENTER CONTENT */}
      <div className="relative flex flex-col items-center gap-8 select-none">
        {/* Character entrance */}
        <div
          className={`w-56 transition-all duration-[1400ms] ease-out 
          transform ${show ? "translate-x-0 opacity-100" : "-translate-x-24 opacity-0"}`}
        >
          <StickerTyler size={9} />
        </div>

        {/* Title */}
        <h1
          className={`text-center font-extrabold 
          text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.35)] 
          text-6xl tracking-wide transition-all duration-[1600ms] delay-200
          ${show ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
        >
          WELCOME
          <br />
          <span className="text-4xl opacity-80">TO MY WORLD</span>
        </h1>

        {/* Prompt like a video game "Press Enter to Start" */}
        <p
          className={`mt-4 text-neutral-200 text-xl tracking-[0.2em] animate-pulse
          transition-opacity duration-[2000ms] delay-1000
          ${show ? "opacity-80" : "opacity-0"}`}
        >
          PRESS ENTER TO BEGIN
        </p>
      </div>
    </div>
  );
}
