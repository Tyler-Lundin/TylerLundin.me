-- Contacts and Quotes Migration
-- - Augment contact_submissions with useful columns
-- - Introduce quote_requests table

create extension if not exists pgcrypto;

-- contact_submissions: add columns if not present
alter table if exists public.contact_submissions
  add column if not exists phone text,
  add column if not exists subject text,
  add column if not exists source text,
  add column if not exists handled_at timestamp with time zone,
  add column if not exists handled_by text,
  add column if not exists updated_at timestamp with time zone default now();

-- indexes (idempotent)
create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status);

-- updated_at trigger (reuse set_updated_at if available)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists contact_submissions_set_updated_at on public.contact_submissions;
create trigger contact_submissions_set_updated_at
  before update on public.contact_submissions
  for each row execute function public.set_updated_at();

-- =====================================
-- quote_requests
-- =====================================
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  contact_email text not null,
  company text null,
  phone text null,
  project_summary text not null,
  scope jsonb null,
  budget_min integer null,
  budget_max integer null,
  currency text null default 'USD',
  timeline text null,
  priority text null,
  status text null default 'new' check (status in ('new','triage','quoted','won','lost','archived')),
  source text null,
  tags text[] null,
  internal_notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now()
);

alter table public.quote_requests enable row level security;

-- RLS: allow anon insert/select to keep parity with current client-side patterns
drop policy if exists "quote_requests_insert_anon" on public.quote_requests;
create policy "quote_requests_insert_anon"
  on public.quote_requests
  for insert
  to anon
  with check (true);

drop policy if exists "quote_requests_select_anon" on public.quote_requests;
create policy "quote_requests_select_anon"
  on public.quote_requests
  for select
  to anon
  using (true);

drop policy if exists "quote_requests_service_role_full" on public.quote_requests;
create policy "quote_requests_service_role_full"
  on public.quote_requests
  for all
  to service_role
  using (true)
  with check (true);

-- Indexes
create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);
create index if not exists quote_requests_status_idx
  on public.quote_requests (status);
create index if not exists quote_requests_tags_gin_idx
  on public.quote_requests using gin (tags);

-- updated_at trigger
drop trigger if exists quote_requests_set_updated_at on public.quote_requests;
create trigger quote_requests_set_updated_at
  before update on public.quote_requests
  for each row execute function public.set_updated_at();

