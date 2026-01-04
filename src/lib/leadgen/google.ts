import { setTimeout as delay } from 'node:timers/promises';

// Support multiple env var names for the Maps API key
const GOOGLE_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
  '';

type TextSearchResult = {
  results: any[];
  next_page_token?: string;
  status: string;
};

export async function textSearchAll(query: string, maxResults: number): Promise<any[]> {
  if (!GOOGLE_API_KEY)
    throw new Error('Missing Google Maps key (set one of: GOOGLE_MAPS_API_KEY, GOOGLE_API_KEY, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)');
  const all: any[] = [];
  let pagetoken: string | undefined;
  while (all.length < maxResults) {
    const page = await textSearchPage(query, pagetoken);
    if (page.results?.length) all.push(...page.results);
    if (!page.next_page_token || all.length >= maxResults) break;
    pagetoken = page.next_page_token;
    await delay(2000);
  }
  return all.slice(0, maxResults);
}

async function textSearchPage(query: string, pagetoken?: string): Promise<TextSearchResult> {
  const base = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const params = new URLSearchParams();
  if (pagetoken) params.set('pagetoken', pagetoken);
  else params.set('query', query);
  params.set('key', GOOGLE_API_KEY);
  const url = `${base}?${params.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`TextSearch failed: ${res.status}`);
  return (await res.json()) as TextSearchResult;
}

export async function getDetails(placeId: string): Promise<any> {
  if (!GOOGLE_API_KEY)
    throw new Error('Missing Google Maps key (set one of: GOOGLE_MAPS_API_KEY, GOOGLE_API_KEY, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)');
  const base = 'https://maps.googleapis.com/maps/api/place/details/json';
  const params = new URLSearchParams();
  params.set('place_id', placeId);
  params.set(
    'fields',
    process.env.PLACES_DETAILS_FIELDS ||
      [
        'place_id',
        'name',
        'formatted_address',
        'geometry/location',
        'formatted_phone_number',
        'website',
        'opening_hours',
        'rating',
        'user_ratings_total',
        'types',
        'price_level',
        'url',
        'business_status',
      ].join(',')
  );
  params.set('key', GOOGLE_API_KEY);
  const url = `${base}?${params.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Details failed: ${res.status}`);
  const data = await res.json();
  return data.result;
}

export function mapToLead(raw: any, niche: string, location: string) {
  const geometry = raw.geometry?.location;
  const lat = typeof geometry?.lat === 'function' ? geometry.lat() : geometry?.lat;
  const lng = typeof geometry?.lng === 'function' ? geometry.lng() : geometry?.lng;
  return {
    google_place_id: raw.place_id,
    niche,
    location,
    name: raw.name,
    formatted_address: raw.formatted_address,
    lat: typeof lat === 'number' ? lat : Number(lat),
    lng: typeof lng === 'number' ? lng : Number(lng),
    phone: raw.formatted_phone_number ?? raw.international_phone_number,
    website: raw.website,
    domain: raw.website ? new URL(raw.website).hostname.replace(/^www\./, '') : undefined,
    rating: raw.rating,
    user_ratings_total: raw.user_ratings_total,
    price_level: raw.price_level,
    types: raw.types,
    business_status: raw.business_status,
    opening_hours: raw.opening_hours,
    google_maps_url: raw.url,
    data: raw,
  };
}
