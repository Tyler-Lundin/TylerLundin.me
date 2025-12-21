import { Loading as UILoading } from '@/components/ui/Loading';
import { themeConfig, billboardThemes } from '@/config/theme';
import type { BillboardThemeKey as BillboardThemeKeyFromConfig } from '@/config/themes/billboard';

export default function Loading() {
  const themeKey: BillboardThemeKeyFromConfig = themeConfig.billboard.themeKey;

  return (
    <main
      className={[
        'max-w-full overflow-x-hidden mx-2 md:mx-4 my-4 rounded-2xl',
        'border border-black/10 dark:border-white/10',
        billboardThemes[themeKey].wrap,
        'text-black dark:text-white',
      ].join(' ')}
    >
      <UILoading fullScreen variant="dots" message="Loading Projects…" />
    </main>
  );
}

