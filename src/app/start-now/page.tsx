import ReactiveBackground from '@/components/ReactiveBackground';
import StartNowWizard from './StartNowWizard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start Your Project | Tyler Lundin',
  description: 'Launch your new website or software project in seconds.',
};

export default async function StartNowPage({
  searchParams,
}: {
  searchParams: Promise<{ promo?: string }>;
}) {
  const { promo } = await searchParams;

  return (<>
      <div className="fixed inset-0 -z-10 opacity-60 ">
      <ReactiveBackground />
      </div>
    <main className="max-w-full overflow-x-hidden backdrop-blur-sm mx-2 md:mx-4 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit z-10 text-black dark:text-white ">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full">
        <StartNowWizard promoCode={promo} />
      </div>
    </main>
  </>);
}
