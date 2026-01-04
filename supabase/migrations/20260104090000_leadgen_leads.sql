-- LeadGen: recreate leads and lead_events tables (destructive)
-- WARNING: Drops existing tables if present

create extension if not exists "pgcrypto";

drop table if exists public.lead_events cascade;
drop table if exists public.leads cascade;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  google_place_id text not null unique,
  niche text not null,
  location text not null,
  name text,
  formatted_address text,
  lat double precision,
  lng double precision,
  phone text,
  website text,
  domain text,
  rating numeric,
  user_ratings_total integer,
  price_level integer,
  types text[],
  business_status text,
  opening_hours jsonb,
  google_maps_url text,
  data jsonb,
  email text,
  status text,
  enrichment_summary jsonb,
  tags text[],
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index idx_leads_place_id on public.leads(google_place_id);
create index idx_leads_niche on public.leads(niche);
create index idx_leads_location on public.leads(location);
create index idx_leads_rating on public.leads(rating);

