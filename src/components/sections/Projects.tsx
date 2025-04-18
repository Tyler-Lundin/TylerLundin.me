import Image from 'next/image';
import Link from 'next/link';
import { ProjectsSection } from '@/types/site';

interface ProjectsProps {
  section: ProjectsSection;
}

export function Projects({ section }: ProjectsProps) {
  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          {section.headline}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.projects.map((project) => (
            <div
              key={project.title}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-video">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <Link
                  href={project.link}
                  className="inline-block text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View Project →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 