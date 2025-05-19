"use client";

import Link from 'next/link';
import ResponsiveDevices from '../landing-page/responsive-devices';

export function Hero() {
  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-4rem)] flex items-center bg-gradient-to-b bg-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:via-neutral-950 dark:to-neutral-800 relative overflow-hidden"
    >
      {/* Optional subtle background gradient/light grain */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-6 py-24 relative z-10 grid md:grid-cols-2 gap-16 items-center">

        {/* Text Section */}
        <div className="text-center md:text-left space-y-8">
          <h1 className="text-5xl lg:text-6xl font-light leading-tight text-black dark:text-white tracking-tight">
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-200 to-blue-600 dark:from-white dark:via-gray-200 dark:to-yellow-200">
              Tailored
            </span>{" "}
            Web Experiences, Built with Precision
          </h1>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto md:mx-0">
            Rogue developer. Detail-obsessed. Building performant, elegant tools that speak louder than noise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <Link
              href="/projects"
              className="px-7 py-3 rounded-full bg-white text-black text-base font-medium hover:bg-neutral-100 transition-colors"
            >
              View Work
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3 rounded-full border border-white/20 text-white text-base font-medium hover:bg-white hover:text-black transition-all"
            >
              Collaborate
            </Link>
          </div>
        </div>

        <ResponsiveDevices />
      </div>
    </section>
  );
}
