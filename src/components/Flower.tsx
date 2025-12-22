"use client";

import { motion } from "framer-motion";
import React from "react";

type FlowerProps = {
  count?: number;        // number of circles
  circleSize?: number;   // px diameter of each circle
  radius?: number;       // px radius of the ring (optional)
  inset?: number;        // tailwind-ish inset override (optional)
  jitter?: number;       // px random offset per circle (0 = none)
};

type DialConfig = {
  min: number;
  max: number;
  step: number;
  everyMs: number;
  integer?: boolean;
};

const CONFIG = {
  // Example you gave:
  count: { min: 0, max: 24, step: 1, everyMs: 9_000, integer: true } satisfies DialConfig,

  // Feel free to tweak these internal ranges anytime.
  circleSize: { min: 8, max: 26, step: 1, everyMs: 3_000 } satisfies DialConfig,
  radius: { min: 22, max: 90, step: 2, everyMs: 3_000 } satisfies DialConfig,
  jitter: { min: 0, max: 6, step: 1, everyMs: 3_000 } satisfies DialConfig,
} as const;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function round(n: number, places = 2) {
  const m = Math.pow(10, places)
  return Math.round(n * m) / m
}

function usePingPongDial(initial: number, cfg: DialConfig) {
  const [value, setValue] = React.useState(() => clamp(initial, cfg.min, cfg.max));
  const dirRef = React.useRef<1 | -1>(1);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setValue((prev) => {
        let next = prev + cfg.step * dirRef.current;

        if (next >= cfg.max) {
          next = cfg.max;
          dirRef.current = -1;
        } else if (next <= cfg.min) {
          next = cfg.min;
          dirRef.current = 1;
        }

        return cfg.integer ? Math.round(next) : next;
      });
    }, cfg.everyMs);

    return () => window.clearInterval(id);
  }, [cfg.everyMs, cfg.max, cfg.min, cfg.step, cfg.integer]);

  return value;
}

export default function Flower({
  count = 8,
  circleSize = 18,
  radius,
  jitter = 0,
}: FlowerProps) {
  // “Active” dials (internally animated ping-pong)
  const activeCount = usePingPongDial(count, CONFIG.count);
  const activeCircleSize = usePingPongDial(circleSize, CONFIG.circleSize);

  // Radius: respect prop if provided, otherwise animate internal radius
  const animatedRadius = usePingPongDial(activeCircleSize * 2.2, CONFIG.radius);
  const r = radius ?? animatedRadius;

  const activeJitter = usePingPongDial(jitter, CONFIG.jitter);

  // deterministic-ish random per index so it doesn’t change every render
  const seeded = (i: number) => {
    const x = Math.sin(i * 999) * 10000;
    return x - Math.floor(x);
  };

  const circles = React.useMemo(() => {
    const n = Math.max(0, Math.floor(activeCount));
    if (n === 0) return [];

    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const jx = activeJitter ? (seeded(i) - 0.5) * 2 * activeJitter : 0;
      const jy = activeJitter ? (seeded(i + 77) - 0.5) * 2 * activeJitter : 0;

      const x = round(Math.cos(a) * r + jx, 3);
      const y = round(Math.sin(a) * r + jy, 3);

      return { i, x, y };
    });
  }, [activeCount, activeJitter, r]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 origin-center aspect-square
                 opacity-10 group-hover:opacity-100 transition-opacity"
      aria-hidden
      suppressHydrationWarning
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ rotate: { duration: 18, repeat: Infinity, ease: "linear" } }}
    >
      {circles.map(({ i, x, y }) => (
        <span
          key={i}
          className={[
            "absolute left-1/2 top-1/2",
            "rounded-full border-2",
            "mix-blend-screen",
            "border-black/50 dark:border-white/50",
          ].join(" ")}
          style={{
            width: activeCircleSize,
            height: activeCircleSize,
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
          }}
        />
      ))}
    </motion.div>
  );
}
