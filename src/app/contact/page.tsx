import { siteConfig } from '@/config/site';
import ContactSimpleForm from '@/components/sections/ContactSimpleForm';
import { Suspense } from 'react';
import StickerTyler from '@/components/StickerTyler';

export default function ContactPage() {
  const contactSection = siteConfig.sections.find(
    (section) => section.type === 'contact'
  );

  if (!contactSection || contactSection.type !== 'contact') {
    return null;
  }

  return (
    <main className="max-w-full overflow-x-hidden mx-2 md:mx-4 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit overflow-visible bg-gradient-to-b from-neutral-50 dark:from-black z-10 via-transparent to-white dark:to-black text-black dark:text-white ">
      <section className="py-10 relative h-full">
        <div className="max-w-4xl mx-auto px-4 text-center">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            {contactSection.headline}
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-neutral-300">
            {contactSection.description}
          </p>
        </div>
      <StickerTyler className="absolute bottom-0 right-0 scale-x-[-1] " size={4} sticker={"waving"} />
      <Suspense fallback={<div className="max-w-3xl mx-auto px-4 mt-6 text-sm text-neutral-600 dark:text-neutral-300">Loading form…</div>}>
        <ContactSimpleForm />
      </Suspense>
      </section>
    </main>
  );
}
