'use client';

import { useEffect } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

const options: ISourceOptions = {
  fullScreen: { enable: true, zIndex: -1 },
  particles: {
    number: { value: 80, density: { enable: true } },
    color: { value: '#ffffff' },
    shape: { type: 'circle' },
    opacity: { value: 0.5 },
    size: { value: 2 },
    links: { enable: true, distance: 150, color: '#ffffff', opacity: 0.1, width: 1 },
    move: { enable: true, speed: 0.5, outModes: { default: 'out' } },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'repulse' },
      onClick: { enable: true, mode: 'push' },
      resize: { enable: true },
    },
    modes: {
      grab: { distance: 400, links: { opacity: 1 } },
      bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
      repulse: { distance: 200, duration: 0.4 },
      push: { quantity: 4 },
      remove: { quantity: 2 },
    },
  },
  detectRetina: true,
};

export default function ReactiveBackground() {
  useEffect(() => {
    initParticlesEngine(async engine => {
      await loadSlim(engine);
    });
  }, []);

  return (
    <>
      <Particles id="tsparticles" options={options} />
    </>
  );
}
