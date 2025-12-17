import { siteConfig } from '@/config/site';
import StickerTyler from '@/components/StickerTyler';
import QuoteWizard from '@/components/sections/QuoteWizard';

export default function QuotePage() {
  const section = siteConfig.sections.find((s) => s.type === 'quote');
  return (
    <main className="max-w-full overflow-x-hidden mx-2 md:mx-4 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit overflow-visible bg-gradient-to-b from-neutral-50 dark:from-black z-10 via-transparent to-white dark:to-black text-black dark:text-white ">
      <StickerTyler className="absolute top-40 right-0 scale-x-[-1] translate-x-1/2 -rotate-20 -z-10" size={8} sticker={"polite"} />
      <section className="py-10">
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
      </section>
      <QuoteWizard />
    </main>
  );
}

