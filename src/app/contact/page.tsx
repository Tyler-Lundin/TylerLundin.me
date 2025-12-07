import { siteConfig } from '@/config/site';
import ContactWizard from '@/components/sections/ContactWizard';

export default function ContactPage() {
  const contactSection = siteConfig.sections.find(
    (section) => section.type === 'contact'
  );

  if (!contactSection || contactSection.type !== 'contact') {
    return null;
  }

  return (
    <main className="py-32 bg-gray-100/50 dark:bg-black/80 backdrop-blur-sm">
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-400 dark:via-pink-400 dark:to-purple-400">
            {contactSection.headline}
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-neutral-300">
            {contactSection.description}
          </p>
        </div>
      </section>
      <ContactWizard />
    </main>
  );
}
