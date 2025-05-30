import WhatIDo from '@/components/landing-page/what-i-do';
import { Hero } from '@/components/sections/Hero';

export default function LandingPage() {

  return (
    <main className="pt-24 bg-gradient-to-b from-neutral-50 dark:from-black z-10  via-transparent to-neutral-100 dark:to-neutral-950 text-black dark:text-white">
      <Hero />
      <WhatIDo />
    </main>
  );
}

