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
    <main className="py-32 bg-gradient-to-b from-neutral-50 dark:from-black via-neutral-50/50 dark:via-neutral-900/50 to-neutral-100 dark:to-neutral-950">
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
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
