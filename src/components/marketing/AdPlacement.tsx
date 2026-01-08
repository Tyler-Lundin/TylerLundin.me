import { getActiveAdsAction } from '@/app/actions/marketing';
import Link from 'next/link';
import AdCarousel from './AdCarousel';

export default async function AdPlacement({ placement }: { placement: string }) {
  try {
    const ads = await getActiveAdsAction(placement);
    if (!ads || ads.length === 0) return null;

    if (placement === 'top_banner') {
      return <AdCarousel ads={ads} />;
    }

    // Take the highest priority ad for other placements
    const ad = ads[0];


    // Fallback / Sidebar style
    const styles = ad.styles || {};
    const bgColor = styles.bg_color || '#1e40af'; // Default blue
    const textColor = styles.text_color || '#ffffff';

    // Construct URL with promo param
    const href = ad.promo_code 
      ? `${ad.cta_link}${ad.cta_link.includes('?') ? '&' : '?'}promo=${ad.promo_code}`
      : ad.cta_link;

    return (
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <h4 className="font-bold text-lg mb-1">{ad.title}</h4>
          {ad.description && <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{ad.description}</p>}
          <Link 
              href={href}
              className="block w-full text-center py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
              {ad.cta_text || 'Check it out'}
          </Link>
      </div>
    );
  } catch (e) {
    console.error('[AdPlacement] Auth crash:', e);
    return null;
  }
}
