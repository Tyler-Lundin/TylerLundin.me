import { About } from '@/components/sections/About';
import { siteConfig } from '@/config/site';

export default function AboutPage() {
  const aboutSection = siteConfig.sections.find(
    (section) => section.type === 'about'
  );

  if (!aboutSection || aboutSection.type !== 'about') {
    return null;
  }

  return (
    <main className="min-h-screen">
      <About section={aboutSection} />
    </main>
  );
} 