import 'dotenv/config';

export const config = {
  googleApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY || '',
  openaiKey: process.env.OPENAI_API_KEY || '',
  detailsFields:
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
    ].join(','),
  qps: Number(process.env.GOOGLE_QPS || 5),
  dryRun: process.env.DRY_RUN === '1',
};

