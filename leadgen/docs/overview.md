# LeadGen Project Overview

## Goal

Build a CLI-first lead generation tool that queries Google Places for niche + location, stores businesses in Supabase, and uses OpenAI to enrich and prioritize leads.

## Core Use Cases

- Batch Search: Provide niches and locations to fetch candidates via Places Text Search + Details.
- Deduping: Upsert by `google_place_id` to avoid duplicates.
- Enrichment (V1): Summarize reviews, classify niches, and generate brief outreach hooks.
- Prioritization (V1): Score leads by review volume, rating, website presence, etc.
- Export (V2): Filtered CSV/JSON exports for campaign upload.

## Tech Stack

- Runtime: Node.js + TypeScript (CLI-first)
- Data: Supabase Postgres
- APIs: Google Places API, OpenAI API
- Auth/Secrets: `.env`

## Data Model (MVP)

- Table `leads`: Core business record (see `supabase/schema.sql`).
- Table `lead_events`: Append-only event log for transitions and notes.

## Architecture (MVP)

- CLI Ingestion: For each (niche, location) → Text Search → paginate → Details → transform → upsert.
- Enrichment Jobs (V1): Batch process new leads, produce summary/score/tags.
- Export (V2): Query + CSV/JSON.

## Key Behaviors

- Rate Limits: Respect next page token delay (~2s), per-second quotas, backoff on `OVER_QUERY_LIMIT`.
- Idempotency: Upsert by `google_place_id`; re-enrich on meaningful data change only.
- Cost Control: Field masks, caching, daily caps.
- Compliance: Use publicly available business data; follow Google Maps Platform TOS.

## Milestones

- V0 – Ingest (this directory): CLI to fetch and store leads.
- V1 – Enrich: OpenAI-based summaries and scoring.
- V2 – Export/Outreach: Export filters and templated outreach text.
- V3 – Dashboard (Optional): Read-only web UI for browsing/filtering leads.

