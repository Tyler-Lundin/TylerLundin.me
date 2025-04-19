import { Hero } from '@/components/sections/Hero';
import { siteConfig } from '@/config/site';

export default function Home() {
  const heroSection = siteConfig.sections.find(
    (section) => section.type === 'hero'
  );

  if (!heroSection || heroSection.type !== 'hero') {
    return null;
  }

  return (
    <main className="">
      <Hero section={heroSection} />
    </main>
  );
}
