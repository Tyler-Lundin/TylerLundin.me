import { Loading as UILoading } from '@/components/ui/Loading';

export default function Loading() {
  return (
    <main className="max-w-full overflow-x-hidden mx-2 md:mx-4 border border-black/10 dark:border-white/10 rounded-lg my-4 min-h-fit overflow-visible bg-gradient-to-b from-neutral-50 dark:from-black z-10 via-transparent to-white dark:to-black text-black dark:text-white">
      <UILoading fullScreen variant="dots" message="Loading About…" />
    </main>
  );
}
