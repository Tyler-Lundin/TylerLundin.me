import { AllProjects } from '@/components/sections/AllProjects';
import { siteConfig } from '@/config/site';

export default function projectsPage() {
  const servicesSection = siteConfig.sections.find(
    (section) => section.type === 'projects'
  );

  if (!servicesSection || servicesSection.type !== 'projects') {
    return null;
  }

  return (
    <main className="pt-24  bg-gray-100/50 dark:bg-black/80 backdrop-blur-sm">
      <AllProjects section={servicesSection} />
    </main>
  );
} 