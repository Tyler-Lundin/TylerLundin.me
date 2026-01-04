export type LeadRecord = {
  id: string;
  name?: string;
  website?: string | null;
  formatted_address?: string | null;
  phone?: string | null;
  rating?: number | null;
  user_ratings_total?: number | null;
};

export type FilterContext = {
  key: string;
  title: string;
  description?: string;
  autoAccept?: (lead: LeadRecord) => { decision: 'keep' | 'reject' | 'skip'; reason?: string } | null;
};

export const FILTERS: Record<string, FilterContext> = {
  website_swipe: {
    key: 'website_swipe',
    title: 'Website Swipe',
    description: 'Review the business website and accept/reject as a redesign candidate. Auto-keep if no website.',
    autoAccept: (lead) => {
      if (!lead.website) return { decision: 'keep', reason: 'no website' };
      return null;
    },
  },
};

