import { Services } from '@/components/sections/Services';
import { siteConfig } from '@/config/site';

export default function ServicesPage() {
  const servicesSection = siteConfig.sections.find(
    (section) => section.type === 'services'
  );

  if (!servicesSection || servicesSection.type !== 'services') {
    return null;
  }

  return (
    <main className="min-h-screen">
      <Services section={servicesSection} />
    </main>
  );
} 