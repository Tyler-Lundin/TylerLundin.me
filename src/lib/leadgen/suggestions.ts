import { waCities } from '@/config/locations/wa';

// Tier 1: High value, high recurring revenue, need local SEO.
const TIER_1_NICHES = [
  'Dentist', 'Orthodontist', 'HVAC', 'Plumber', 'Roofer', 'Electrician', 
  'Personal Injury Lawyer', 'Cosmetic Surgeon', 'Real Estate Agent', 'Home Builder'
];

// Tier 2: Good volume, moderate value.
const TIER_2_NICHES = [
  'Landscaper', 'Chiropractor', 'Massage Therapist', 'Auto Repair', 
  'House Cleaning', 'Moving Company', 'Painter', 'Flooring Contractor', 
  'Wedding Photographer', 'Event Planner'
];

// Tier 3: High volume, lower margin or high competition.
const TIER_3_NICHES = [
  'Coffee Shop', 'Restaurant', 'Barber Shop', 'Hair Salon', 'Gym', 
  'Yoga Studio', 'Florist', 'Bakery', 'Brewery', 'Pizza'
];

const TARGET_NICHES = [...TIER_1_NICHES, ...TIER_2_NICHES, ...TIER_3_NICHES];

// Major WA cities to prioritize (heuristic based on population/market size)
const MAJOR_CITIES = new Set([
  'Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 
  'Renton', 'Spokane Valley', 'Federal Way', 'Yakima', 'Bellingham', 'Kennewick'
]);

export type Suggestion = {
  niche: string;
  location: string;
  reason: string;
  score: number;
  type: 'gap' | 'expansion' | 'retry';
};

/**
 * Generates smart suggestions for lead generation.
 * @param existingRuns Array of { niche, location, last_searched_at } from the DB.
 * @param count Number of suggestions to return.
 */
export function generateSmartSuggestions(
  existingRuns: { niche: string; location: string; last_searched_at?: string | null }[],
  count: number = 10
): Suggestion[] {
  const runMap = new Set(
    existingRuns.map(r => `${r.niche.toLowerCase()}|${r.location.toLowerCase()}`)
  );

  const candidates: Suggestion[] = [];

  // 1. "The Colonizer" Strategy: Fill gaps in Major Cities with Tier 1 Niches
  for (const city of waCities) {
    // Only focus on major cities for the "Colonizer" strategy to ensure high hit rate
    const isMajor = MAJOR_CITIES.has(city.name);
    
    // Skip tiny towns for the main automated suggestions to avoid low-yield queries
    // (Unless specifically requested, but for "Smart Suggestions" we want hits)
    if (!isMajor && Math.random() > 0.1) continue; 

    for (const niche of TARGET_NICHES) {
      const key = `${niche.toLowerCase()}|${city.name.toLowerCase()}`;
      
      if (!runMap.has(key)) {
        let score = 0;
        
        // Base score by Niche Tier
        if (TIER_1_NICHES.includes(niche)) score += 50;
        else if (TIER_2_NICHES.includes(niche)) score += 30;
        else score += 10;

        // Boost for Major Cities
        if (isMajor) score += 40;

        // Random jitter to rotate suggestions
        score += Math.random() * 20;

        candidates.push({
          niche,
          location: `${city.name}, WA`,
          reason: isMajor 
            ? `Untapped major market: ${niche} in ${city.name}` 
            : `Expansion opportunity: ${niche} in ${city.name}`,
          score,
          type: 'gap'
        });
      }
    }
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, count);
}
