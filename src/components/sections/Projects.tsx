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
    <section id="projects" className="min-h-screen py-20 bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-12 text-center">
          {section.headline}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div onClick={() => setSelectedProject('https://island-market.vercel.app')}>
            <IslandMarketProject />
          </div>
          <div onClick={() => setSelectedProject('https://fastcachepawn.vercel.app')}>
            <FastCachePawnProject />
          </div>
          <div onClick={() => setSelectedProject('https://foxlot.app')}>
            <FoxLotProject />
          </div>
          <div onClick={() => setSelectedProject('/contact')}>
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