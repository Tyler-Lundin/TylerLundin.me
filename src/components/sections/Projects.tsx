'use client';

import { ProjectsSection } from '@/types/site';
import { IslandMarketProject } from '../projects/IslandMarketProject';
import { FastCachePawnProject } from '../projects/FastCachePawnProject';
import { GhostProject } from '../projects/GhostProject';
import { FoxLotProject } from '../BookingProject';
import { LundinVisionProject } from '../projects/LundinVisionProject';

interface ProjectsProps {
  section: ProjectsSection;
}

export function Projects({ section }: ProjectsProps) {
  return (
    <section id="projects" className="min-h-screen py-20 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 animate-gradient" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-5xl font-bold mb-16 text-center">
          <span className="relative">
            {section.headline}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl -z-10" />
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <a 
            href="https://lundin-vision.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="backdrop-blur-sm bg-gradient-to-bl from-white/10 to-white/50 dark:from-black/10 dark:to-black/50 rounded-sm rounded-tl-3xl rounded-br-3xl border border-white/20 dark:border-white/10 shadow-2xl p-6 hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <LundinVisionProject />
          </a>
          <a 
            href="https://island-market.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="backdrop-blur-sm bg-gradient-to-bl from-white/10 to-white/50 dark:from-black/10 dark:to-black/50 rounded-sm rounded-tl-3xl rounded-br-3xl border border-white/20 dark:border-white/10 shadow-2xl p-6 hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <IslandMarketProject />
          </a>
          <a 
            href="https://fastcachepawn.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="backdrop-blur-sm bg-gradient-to-bl from-white/10 to-white/50 dark:from-black/10 dark:to-black/50 rounded-sm rounded-tl-3xl rounded-br-3xl border border-white/20 dark:border-white/10 shadow-2xl p-6 hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <FastCachePawnProject />
          </a>
          <a 
            href="https://foxlot.app"
            target="_blank"
            rel="noopener noreferrer"
            className="backdrop-blur-sm bg-gradient-to-bl from-white/10 to-white/50 dark:from-black/10 dark:to-black/50 rounded-sm rounded-tl-3xl rounded-br-3xl border border-white/20 dark:border-white/10 shadow-2xl p-6 hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <FoxLotProject />
          </a>
          <a 
            href="/contact"
            className="backdrop-blur-sm bg-gradient-to-bl from-white/10 to-white/50 dark:from-black/10 dark:to-black/50 rounded-sm rounded-tl-3xl rounded-br-3xl border border-white/20 dark:border-white/10 shadow-2xl p-6 hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <GhostProject />
          </a>
        </div>
      </div>
    </section>
  );
} 