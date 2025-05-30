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
    <main className="min-h-screen pt-24">
      <Hobbies section={servicesSection} />
    </main>
  );
} 