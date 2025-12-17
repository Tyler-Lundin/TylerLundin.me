import { siteConfig } from '@/config/site';
import ContactSimpleForm from '@/components/sections/ContactSimpleForm';
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
      <StickerTyler className="absolute top-40 right-0 scale-x-[-1] translate-x-1/2 -rotate-20 -z-10" size={8} sticker={"polite"} />
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
      <ContactSimpleForm />
    </main>
  );
}
