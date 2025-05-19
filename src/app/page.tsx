import WhatIDo from '@/components/landing-page/what-i-do';
import { Hero } from '@/components/sections/Hero';

export default function LandingPage() {

  return (
    <main className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <Hero />
      <WhatIDo />
    </main>
  );
}

