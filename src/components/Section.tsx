import type { Section as SectionType } from '@/types/site';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { AllProjects } from './sections/AllProjects';
import { Contact } from './sections/Contact';
import { WebDevProjects } from './sections/WebDevProjects';

interface SectionProps {
  section: SectionType;
}

export function Section({ section }: SectionProps) {
  switch (section.type) {
    case 'home':
      return <Hero />;
    case 'about':
      return <About />;
    case 'projects':
      return <AllProjects section={section} />;
    case 'projects/web-dev':
      return <WebDevProjects section={section} />;
    case 'contact':
      return <Contact section={section} />;
    default:
      return null;
  }
} 