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
    <main className="min-h-screen pt-16">
      <Contact section={contactSection} />
    </main>
  );
} 