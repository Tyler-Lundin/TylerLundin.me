import Image from 'next/image';
import { AboutSection } from '@/types/site';

interface AboutProps {
  section: AboutSection;
}

export function About({ section }: AboutProps) {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square">
            <Image
              src={section.image}
              alt="Profile picture"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {section.headline}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {section.content}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 