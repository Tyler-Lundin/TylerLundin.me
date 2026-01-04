# LeadGen CLI

CLI-first lead generation tool that queries Google Places for niche + location, stores businesses in Supabase, and (later) uses OpenAI to enrich and prioritize leads.

## Quick Start

1) Create an `.env` from `.env.example` and fill keys.

2) Install deps:
- `cd leadgen`
- `npm install`

3) Run a dry fetch (prints JSON, no DB writes):
- `npx tsx src/index.ts --niches="dentist,plumber" --locations="Austin, TX" --max=60 --dry-run`

4) Upsert to Supabase (requires `SUPABASE_URL` + key):
- `npm run build && node dist/index.js --niches="dentist" --locations="Austin, TX" --max=100`

## Commands

- `--niches` comma-separated list (e.g., `dentist,plumber`)
- `--locations` comma-separated list (e.g., `Austin, TX,Dallas, TX`)
- `--max` cap per (niche, location) batch
- `--dry-run` prints leads to stdout instead of DB upsert

## Environment

See `.env.example` for required keys. Minimal for V0:
- `GOOGLE_MAPS_API_KEY`
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE`) if writing to DB

## Data Model

SQL at `supabase/schema.sql` defines `leads` and `lead_events`.

## Roadmap

- V0: Ingest via Google Places Text Search + Details; upsert to Supabase
- V1: Enrichment with OpenAI (summaries, tags, score)
- V2: Export filters + outreach hooks
- V3: Optional dashboard

