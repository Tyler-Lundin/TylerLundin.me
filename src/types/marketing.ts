export interface Advertisement {
  id: string;
  title: string;
  description?: string | null;
  placement: 'banner' | 'sidebar' | 'toast' | 'modal' | string;
  priority: number;
  cta_text: string | null;
  cta_link: string;
  promo_code?: string | null;
  is_active: boolean;
  starts_at: string;
  ends_at?: string | null;
  styles?: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}
