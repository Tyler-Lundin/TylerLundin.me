import { siteConfig } from '@/config/site';
import StickerTyler from '@/components/StickerTyler';
import QuoteWizard from '@/components/sections/QuoteWizard';

export default function QuotePage() {
  const section = siteConfig.sections.find((s) => s.type === 'quote');
  return (
    <main className="max-w-full overflow-x-hidden mx-2 md:mx-4 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit overflow-visible bg-gradient-to-b from-neutral-50 dark:from-black z-10 via-transparent to-white dark:to-black text-black dark:text-white ">
      <section className="py-10 relative overflow-hidden ">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            Request a Quote
          </h1>
          {section && 'description' in section && (
            <p className="mt-3 text-lg text-slate-600 dark:text-neutral-300">
              {section.description as string}
            </p>
          )}
        </div>
      <StickerTyler className="absolute bottom-0 right-0 scale-x-[-1] " size={4} sticker={"waving"} />
      <QuoteWizard />
      </section>
    </main>
  );
}

