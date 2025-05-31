"use client";

import Link from 'next/link';
import { Badge, BadgeContent } from '../Badge';
export function Hero() {


  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-4rem)] flex flex-col justify-center relative overflow-hidden"
    >
      {/* Animated background gradient */}

      {/* Glass morphism container */}
      <Badge>
        <div className="w-full h-full pt-8 sm:pt-14">


          <div className="space-y-4">
            {/* Profile and Role Section */}

            <BadgeContent />

            {/* Buttons with Glass Effect */}
            <div className="flex sm:flex-col px-4 gap-4 justify-center">
              <Link
                href="/projects"
                className="p-1 text-sm md:text-lg w-fit sm:w-full md:p-2 rounded-xl hover:blur-[2px] text-center backdrop-blur-sm bg-green-500 border border-black/25 text-neutral-100 text-base font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Projects
              </Link>
              <Link
                href="/contact"
                className="p-1 text-sm md:text-lg w-fit sm:w-full md:p-2 rounded-xl hover:blur-[2px] text-center backdrop-blur-sm bg-blue-500 border border-black/25 text-neutral-100 text-base font-medium transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              >
                Msg Me
              </Link>
            </div>
          </div>
        </div>
      </Badge>
    </section>
  );
}




