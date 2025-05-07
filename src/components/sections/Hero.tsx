"use client";

import Link from 'next/link';
import Image from 'next/image';
import AnimatedBackground from '../AnimatedBackground';

export function Hero() {
  return (
    <section id="hero" className="min-h-[calc(100vh-4rem)] flex items-center relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-indigo-400/10 rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-amber-300/10 rounded-full animate-pulse delay-100" />
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_30%_107%,rgba(253,292,45,0.05)_0%,rgba(34,90,245,0.05)_100%)]" />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text content */}
          <div className="space-y-8 text-center md:text-left">
            <div className="space-y-4">
              {/* Mobile profile image */}
              <div className="md:hidden flex justify-center mb-6 relative">
                <div className="w-[300px] h-[300px] rounded-full relative overflow-hidden border-4 border-indigo-500/50 shadow-xl">
                  <div className="z-[100] bg-black/40 border-12 border-white overflow-hidden rounded-full w-full h-full absolute">
                    <div className="relative w-full h-full overflow-hidden rotate-45">
                      <div className="absolute bg-gradient-to-r invert from-indigo-400/30 via-pink-500/30 to-yellow-200/30 w-full h-full left-1/2 -translate-x-1/2 top-1/2 -z-10" />
                      <div className="absolute bg-gradient-to-r invert from-indigo-400/30 via-pink-500/30 to-yellow-200/30 w-full h-full left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 -z-10" />
                    </div>
                  </div>
                  <AnimatedBackground>
                    <Image
                      src="/images/tyler.png"
                      alt="Tyler Lundin"
                      width={160}
                      height={160}
                      className="absolute inset-0 w-full h-full z-50 object-cover object-top -translate-x-[5%]  translate-y-[0%] z-10 pointer-events-none "

                    />
                  </AnimatedBackground>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
                Crafting <span className="text-indigo-400">Fearless</span> Web Experiences
              </h1>
            </div>
            <p className="text-xl text-gray-300 leading-relaxed max-w-xl mx-auto md:mx-0">
              Rogue developer. Focused. Fast. Building digital tools that cut through the noise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-8">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
              >
                View My Work 🚀
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-gray-900 text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Let&apos;s Build Something 🤝
              </Link>
            </div>
          </div>

          {/* Desktop profile image */}
          <div className="hidden md:flex justify-center items-center relative">
            <div className="bg-black w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] border-[6px] border-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 animate-border rounded-full relative overflow-hidden">
              <AnimatedBackground>
                <Image
                  src="/images/tyler.png"
                  alt="Tyler Lundin"
                  fill
                  priority
                  sizes="(max-width: 768px) 300px, (max-width: 1200px) 400px, 500px"
                  className="absolute inset-0 w-full h-full z-50 object-cover object-top translate-y-[0%] z-10 pointer-events-none "
                />
              </AnimatedBackground>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
