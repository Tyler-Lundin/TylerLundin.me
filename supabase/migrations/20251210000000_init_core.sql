-- Core initialization migration for app-used tables
-- Notes:
-- - Policies are intentionally permissive for anon SELECT on read-heavy tables
--   to match current UI usage. Tighten to `authenticated` when auth is added.

-- Extensions (for gen_random_uuid)
create extension if not exists pgcrypto;

-- ============================
-- contact_submissions
-- ============================
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  budget text null,
  status text null default 'new',
  created_at timestamp with time zone null default now()
);

alter table public.contact_submissions enable row level security;

drop policy if exists "contact_submissions_insert_anon" on public.contact_submissions;
create policy "contact_submissions_insert_anon"
  on public.contact_submissions
  for insert
  to anon
  with check (true);

drop policy if exists "contact_submissions_select_anon" on public.contact_submissions;
create policy "contact_submissions_select_anon"
  on public.contact_submissions
  for select
  to anon
  using (true);

drop policy if exists "contact_submissions_write_service_role" on public.contact_submissions;
create policy "contact_submissions_write_service_role"
  on public.contact_submissions
  for all
  to service_role
  using (true)
  with check (true);

-- Index for recency queries
create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

-- ============================
-- journal_entries
-- ============================
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  entry_text text not null,
  status_text text not null,
  published boolean null default false,
  created_at timestamp with time zone null default now()
);

alter table public.journal_entries enable row level security;

drop policy if exists "journal_entries_insert_anon" on public.journal_entries;
create policy "journal_entries_insert_anon"
  on public.journal_entries
  for insert
  to anon
  with check (true);

drop policy if exists "journal_entries_select_anon" on public.journal_entries;
create policy "journal_entries_select_anon"
  on public.journal_entries
  for select
  to anon
  using (true);

drop policy if exists "journal_entries_write_service_role" on public.journal_entries;
create policy "journal_entries_write_service_role"
  on public.journal_entries
  for all
  to service_role
  using (true)
  with check (true);

-- Index for recency and published flag
create index if not exists journal_entries_created_at_idx
  on public.journal_entries (created_at desc);
create index if not exists journal_entries_published_idx
  on public.journal_entries (published);

-- ============================
-- users (minimal/future use)
-- ============================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text null,
  role text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now()
);

alter table public.users enable row level security;

drop policy if exists "users_service_role_full" on public.users;
create policy "users_service_role_full"
  on public.users
  for all
  to service_role
  using (true)
  with check (true);

-- Optional: read for authenticated roles later (disabled for now)
-- create policy "users_select_authenticated" on public.users for select to authenticated using (true);

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();
