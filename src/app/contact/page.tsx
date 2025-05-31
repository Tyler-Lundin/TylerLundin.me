import { Contact } from '@/components/sections/Contact';
import { siteConfig } from '@/config/site';

export default function ContactPage() {
  const contactSection = siteConfig.sections.find(
    (section) => section.type === 'contact'
  );

  if (!contactSection || contactSection.type !== 'contact') {
    return null;
  }

  return (
    <main className="pt-24  bg-gray-100/50 dark:bg-black/80 backdrop-blur-sm">
      <Contact section={contactSection} />
    </main>
  );
} 