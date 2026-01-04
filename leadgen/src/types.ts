export type Lead = {
  id?: string;
  google_place_id: string;
  niche: string;
  location: string;
  name?: string;
  formatted_address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  domain?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  business_status?: string;
  opening_hours?: unknown;
  google_maps_url?: string;
  data?: unknown;
  email?: string | null;
  status?: string | null;
  enrichment_summary?: unknown;
  tags?: string[] | null;
  notes?: string | null;
  last_contacted_at?: string | null;
};

