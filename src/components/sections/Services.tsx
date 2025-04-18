import { ServicesSection } from '@/types/site';

interface ServicesProps {
  section: ServicesSection;
}

export function Services({ section }: ServicesProps) {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          {section.headline}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.items.map((item) => (
            <div
              key={item}
              className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {item}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 