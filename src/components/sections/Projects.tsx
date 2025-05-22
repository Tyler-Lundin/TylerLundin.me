'use client';

import { useState } from 'react';
import { ProjectsSection } from '@/types/site';
import { IslandMarketProject } from '../projects/IslandMarketProject';
import { FastCachePawnProject } from '../projects/FastCachePawnProject';
import { GhostProject } from '../projects/GhostProject';
import { FoxLotProject } from '../BookingProject';
import { Modal } from '../Modal';

interface ProjectsProps {
  section: ProjectsSection;
}

export function Projects({ section }: ProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  return (
    <section id="projects" className="min-h-screen py-20 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-bold mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 dark:from-cyan-300 dark:via-pink-400 dark:to-purple-400 tracking-tight">
          {section.headline}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div 
            onClick={() => setSelectedProject('https://island-market.vercel.app')}
            className="rounded-xl p-6 bg-neutral-800/30 dark:bg-neutral-900/50 border border-neutral-700/50 dark:border-neutral-800/70 hover:bg-neutral-700/50 dark:hover:bg-neutral-800/70 transition-all duration-300 ease-in-out cursor-pointer shadow-lg hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30 transform hover:-translate-y-1"
          >
            <IslandMarketProject />
          </div>
          <div 
            onClick={() => setSelectedProject('https://fastcachepawn.vercel.app')}
            className="rounded-xl p-6 bg-neutral-800/30 dark:bg-neutral-900/50 border border-neutral-700/50 dark:border-neutral-800/70 hover:bg-neutral-700/50 dark:hover:bg-neutral-800/70 transition-all duration-300 ease-in-out cursor-pointer shadow-lg hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30 transform hover:-translate-y-1"
          >
            <FastCachePawnProject />
          </div>
          <div 
            onClick={() => setSelectedProject('https://foxlot.app')}
            className="rounded-xl p-6 bg-neutral-800/30 dark:bg-neutral-900/50 border border-neutral-700/50 dark:border-neutral-800/70 hover:bg-neutral-700/50 dark:hover:bg-neutral-800/70 transition-all duration-300 ease-in-out cursor-pointer shadow-lg hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30 transform hover:-translate-y-1"
          >
            <FoxLotProject />
          </div>
          <div 
            onClick={() => setSelectedProject('/contact')}
            className="rounded-xl p-6 bg-neutral-800/30 dark:bg-neutral-900/50 border border-neutral-700/50 dark:border-neutral-800/70 hover:bg-neutral-700/50 dark:hover:bg-neutral-800/70 transition-all duration-300 ease-in-out cursor-pointer shadow-lg hover:shadow-pink-500/20 dark:hover:shadow-pink-400/30 transform hover:-translate-y-1"
          >
            <GhostProject />
          </div>
        </div>

        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          url={selectedProject || ''}
        />
      </div>
    </section>
  );
} 