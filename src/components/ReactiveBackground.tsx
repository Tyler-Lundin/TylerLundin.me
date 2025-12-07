'use client';

import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { randomHexColor } from '@/lib/utils';

export default function ReactiveBackground() {
  const [isMounted, setIsMounted] = useState(false);
  const systemTheme = useSystemTheme(); // Our new custom hook
  const [hoverMode, setHoverMode] = useState<'attract' | 'repulse'>('attract');

  useEffect(() => {
    // This effect runs once to initialize the particles engine
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setIsMounted(true);
    });
  }, []);

  // Swap between pulling (attract) and pushing (repulse) every ~10s
  useEffect(() => {
    const id = setInterval(() => {
      setHoverMode((m) => (m === 'attract' ? 'repulse' : 'attract'));
    }, 10000);
    return () => clearInterval(id);
  }, []);

const particleOptions: ISourceOptions = useMemo(() => {
  // const color = systemTheme === 'dark' ? '#ffffff' : '#000000';
  //
  const color = randomHexColor(systemTheme as "light" | "dark")

  return {
    // Render within parent container so parent can control opacity/stacking
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    particles: {
      number: { value: 52, density: { enable: true, area: 900 } }, // slightly sparse, elegant
      color: { value: color },

      shape: {
        type: ['circle', 'square'], // dual-shape visual texture
        polygon: { sides: 5 },
      },

      size: {
        value: { min: 2, max: 4 }, // variation adds depth
        animation: { enable: true, speed: 1, minimumValue: 1, sync: false },
      },

      links: {
        enable: true,
        distance: 490, // closer net than yours, more web-like
        color: color,
        opacity: 0.15,
        width: 0.3,
        triangles: { enable: true, opacity: 0.01 }, // subtle triangle networks
      },

      move: {
        enable: true,
        speed: 0.35,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' },
        attract: { enable: false },
      },

      opacity: {
        value: { min: 0.2, max: 0.9 },
        animation: { enable: true, speed: 0.6, minimumValue: 0.3, sync: false },
      },
    },

    interactivity: {
      events: {
        onHover: { enable: true, mode: hoverMode }, // swap between pull/push
        onClick: { enable: true, mode: 'emitter' },
      },
      modes: {
        attract: { distance: 300, duration: 0.4, factor: 1.8 },
        // Softer push effect
        repulse: { distance: 160, duration: 0.28 },
        emitter: {
          rate: { delay: 0.15, quantity: 3 },
          size: { width: 0, height: 0 },
        },
      },
    },

    detectRetina: true,
  };
}, [systemTheme, hoverMode]);


  // Only render after the component has mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Particles id="tsparticles" options={particleOptions} />
    </>
  );
}
