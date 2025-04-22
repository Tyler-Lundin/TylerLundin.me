import { ProjectsSection } from '@/types/site';
import { IslandMarketProject } from '../projects/IslandMarketProject';
import { FastCachePawnProject } from '../projects/FastCachePawnProject';
import { GhostProject } from '../projects/GhostProject';
import { BookingProject } from '../BookingProject';
interface ProjectsProps {
  section: ProjectsSection;
}

export function Projects({ section }: ProjectsProps) {
  return (
    <section id="projects" className=" min-h-screen py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          {section.headline}
        </h2>
          {/* Island Market Project with Slideshow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <IslandMarketProject />
            <FastCachePawnProject />
            <BookingProject />  


            
            {/* LAST PROJECT IS GHOST PROJECT */}
            <GhostProject />
          </div>

      </div>
    </section>
  );
} 