import AdsManager from '@/components/marketing/ads/AdsManager';
import { getAllAdsAction } from '@/app/actions/marketing-admin';

export default async function MarketingAdsPage() {
  const ads = await getAllAdsAction();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">Ads Management</h1>
      <AdsManager initialAds={ads} />
    </div>
  );
}
