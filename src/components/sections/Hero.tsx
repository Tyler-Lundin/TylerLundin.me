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
        <div className="w-full h-full pt-14">


          <div className="space-y-2">
            {/* Profile and Role Section */}

            <BadgeContent />

            {/* Buttons with Glass Effect */}
            <div className="flex flex-col sm:flex-row gap-4 pt-3 justify-center">
              <Link
                href="/projects"
                className="p-2 rounded-xl hover:blur-[2px] text-center backdrop-blur-sm bg-green-500 border border-black/25 text-neutral-100 text-base font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                View My Projects
              </Link>
              <Link
                href="/contact"
                className="p-2 rounded-xl hover:blur-[2px] text-center backdrop-blur-sm bg-blue-500 border border-black/25 text-neutral-100 text-base font-medium transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
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




