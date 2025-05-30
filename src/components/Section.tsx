import type { Section as SectionType } from '@/types/site';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Projects } from './sections/Projects';
import { Hobbies } from './sections/Hobbies';
import { Contact } from './sections/Contact';

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
      return <Projects section={section} />;
    case 'hobbies':
      return <Hobbies section={section} />;
    case 'contact':
      return <Contact section={section} />;
    default:
      return null;
  }
} 