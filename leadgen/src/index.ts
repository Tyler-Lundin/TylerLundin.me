#!/usr/bin/env node
import { textSearchAll, getDetails } from './google.js';
import { upsertLeads } from './supabase.js';
import type { Lead } from './types.js';
import { config } from './config.js';

type Args = Record<string, string | boolean>;

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const [k, v] = token.slice(2).split('=');
      if (v !== undefined) {
        args[k] = v;
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        args[k] = argv[++i];
      } else {
        args[k] = true;
      }
    }
  }
  return args;
}

function toList(val?: string | boolean): string[] {
  if (!val || typeof val !== 'string') return [];
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapToLead(raw: any, niche: string, location: string): Lead {
  const geometry = raw.geometry?.location;
  const lat = geometry?.lat ?? geometry?.lat?.toString?.();
  const lng = geometry?.lng ?? geometry?.lng?.toString?.();
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

async function run() {
  const args = parseArgs(process.argv);
  const niches = toList((args.niches as string) || (args.niche as string));
  const locations = toList((args.locations as string) || (args.location as string));
  const max = Number((args.max as string) || 100);
  const dry = Boolean(args['dry-run'] || args.dry || config.dryRun || false);

  if (!config.googleApiKey) {
    console.error('Missing GOOGLE_MAPS_API_KEY');
    process.exit(1);
  }
  if (!niches.length || !locations.length) {
    console.error('Usage: leadgen --niches="dentist,plumber" --locations="Austin, TX" [--max=200] [--dry-run]');
    process.exit(1);
  }

  const leads: Lead[] = [];
  for (const niche of niches) {
    for (const location of locations) {
      const query = `${niche} in ${location}`;
      const results = await textSearchAll(query, max);
      for (const r of results) {
        const details = await getDetails(r.place_id);
        const lead = mapToLead(details ?? r, niche, location);
        leads.push(lead);
      }
    }
  }

  if (dry || !config.supabaseUrl || !config.supabaseKey) {
    console.log(JSON.stringify(leads, null, 2));
    console.error(`Collected ${leads.length} leads (dry-run or no Supabase configured).`);
    return;
  }

  const { count } = await upsertLeads(leads);
  console.error(`Upserted ${count} leads.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

