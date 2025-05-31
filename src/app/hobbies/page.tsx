import { Hobbies } from '@/components/sections/Hobbies';
import { siteConfig } from '@/config/site';

export default function ServicesPage() {
  const servicesSection = siteConfig.sections.find(
    (section) => section.type === 'hobbies'
  );

  if (!servicesSection || servicesSection.type !== 'hobbies') {
    return null;
  }

  return (
    <main className="pt-24  bg-gray-100/50 dark:bg-black/80 backdrop-blur-sm">
      <Hobbies section={servicesSection} />
    </main>
  );
} 