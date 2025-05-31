"use client";

import Link from 'next/link';
import Image from 'next/image';
import TerminalBanner from '../TerminalBanner';
export function Hero() {


  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-4rem)] flex flex-col justify-center relative overflow-hidden"
    >
      {/* Animated background gradient */}

      {/* Glass morphism container */}
      <Badge>
        <div className="w-full h-full pt-14">


          <div className="space-y-2">
            {/* Profile and Role Section */}

            {/* Profile Image with Glass Effect */}
            <div className="relative w-32 h-32 mx-auto ">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
              <div className="relative w-full h-full rounded-full overflow-hidden border border-black/25 dark:border-white/25 backdrop-blur-sm">
                <Image
                  src="/images/tyler.png"
                  alt="Tyler"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Name with Glass Effect */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight text-center">
              <span className="relative">
                Tyler Lundin
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl -z-10" />
              </span>
            </h1>
            <TerminalBanner />

            {/* Buttons with Glass Effect */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
              <Link
                href="/projects"
                className="p-2 rounded-xl text-center backdrop-blur-sm bg-green-400 dark:bg-black/10 border border-black/25 dark:border-white/10 text-neutral-800 dark:text-neutral-200 text-base font-medium hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                View My Projects
              </Link>
              <Link
                href="/contact"
                className="p-2 rounded-xl text-center backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-black/25 dark:border-white/5 text-neutral-800 dark:text-neutral-200 text-base font-medium hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </Badge>
    </section>
  );
}




function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[400px] h-[600px] mx-auto">
      {/* SVG background with cutout */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 600"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 w-full h-full shadow-lg border border-black/25 dark:border-white/25 rounded-2xl"
      >
        <defs>
          <mask className='' id="pillCutout">
            {/* Full white = visible */}
            <rect width="400" height="600" fill="white" />
            {/* Black = cutout */}
            <rect x="150" y="15" width="100" height="20" rx="10" ry="10" fill="black" />
          </mask>
        </defs>

        <rect
          width="400"
          height="600"
          fill="#ddd"
          mask="url(#pillCutout)"
          rx="12"
        />
      </svg>

      {/* Content inside badge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}
