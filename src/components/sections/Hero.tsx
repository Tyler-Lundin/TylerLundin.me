"use client";

import Link from 'next/link';

export function Hero() {
  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-gradient-to-b from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 relative overflow-hidden text-center px-4 sm:px-6 lg:px-8"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 invert dark:invert-0 grayscale sepia opacity-25"
        style={{
          backgroundImage: "url('/images/landing-page/hero-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundBlendMode: 'multiply',
        }}
      />
      {/* Optional subtle background gradient/light grain */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,120,120,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 dark:from-black z-10  via-transparent to-neutral-100 dark:to-neutral-950" />
      
      <div className="max-w-3xl relative z-10 space-y-8">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-neutral-800 dark:text-neutral-100 tracking-tight">
          Hello, I&apos;m Tyler.
        </h1>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-700 dark:text-neutral-200 tracking-tight">
          A <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">Full-Stack Developer</span>
          <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 text-neutral-600 dark:text-neutral-300"> & Digital Craftsman.</span>
        </h2>

        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          I build high-performance, user-focused web applications that drive results. Turning complex ideas into elegant and effective digital solutions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link
            href="/projects"
            className="px-8 py-3.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-base font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            View My Projects
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3.5 rounded-lg border border-neutral-700 dark:border-neutral-300 text-neutral-700 dark:text-neutral-300 text-base font-medium hover:bg-neutral-700/10 dark:hover:bg-white/10 transition-colors duration-300 ease-in-out transform hover:-translate-y-0.5"
          >
            Get In Touch
          </Link>
        </div>
      </div>
    </section>
  );
}
