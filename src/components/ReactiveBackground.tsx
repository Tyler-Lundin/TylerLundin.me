'use client';

import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';
import { useSystemTheme } from '@/hooks/useSystemTheme';

export default function ReactiveBackground() {
  const [isMounted, setIsMounted] = useState(false);
  const systemTheme = useSystemTheme(); // Our new custom hook

  useEffect(() => {
    // This effect runs once to initialize the particles engine
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setIsMounted(true);
    });
  }, []);

  // useMemo will re-calculate the options only when the theme changes
  const particleOptions: ISourceOptions = useMemo(() => {
    const particleColor = systemTheme === 'dark' ? '#ffffff' : '#000000';
    return {
      fullScreen: { enable: true, zIndex: -1 },
      particles: {
        number: { value: 66, density: { enable: true } },
        color: { value: particleColor }, // Use the dynamic color
        shape: { type: 'circle' },
        size: { value: 2 },
        // links: {
        //   enable: true,
        //   distance: 100,
        //   color: particleColor,
        //   opacity: 0.4,
        //   width: 3,
        // },
        move: {
          enable: true,
          speed: 0.5,
          outModes: { default: 'out' },
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'repulse' },
          onClick: { enable: true, mode: 'push' },
          resize: { enable: true },
        },
        modes: {
          repulse: { distance: 150, duration: 0.4 },
          push: { quantity: 2 },
        },
      },
      detectRetina: true,
    };
  }, [systemTheme]); // Dependency array ensures this runs when the system theme changes

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
