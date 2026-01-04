-- LeadGen filters and groups (idempotent, destructive-create)
create extension if not exists "pgcrypto";

-- Groups for organizing leads
drop table if exists public.lead_group_members cascade;
drop table if exists public.lead_groups cascade;

create table public.lead_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.lead_group_members (
  group_id uuid not null references public.lead_groups(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (group_id, lead_id)
);

-- Modular filters and results
drop table if exists public.lead_filter_results cascade;
drop table if exists public.lead_filters cascade;

create table public.lead_filters (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.lead_filter_results (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  filter_key text not null,
  decision text not null, -- keep | reject | skip
  reason text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_lfr_filter_key on public.lead_filter_results(filter_key);
create index if not exists idx_lfr_lead_filter on public.lead_filter_results(lead_id, filter_key);

