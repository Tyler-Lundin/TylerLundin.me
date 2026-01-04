-- LeadGen: search runs history for niches/locations
create extension if not exists "pgcrypto";

create table if not exists public.lead_search_runs (
  id uuid primary key default gen_random_uuid(),
  niche text not null,
  location text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz null,
  original_count int null,
  deduped_count int null,
  saved_count int null,
  dry_run boolean not null default true,
  notes text null
);

create index if not exists lead_search_runs_niche_loc_idx
on public.lead_search_runs(niche, location);

create index if not exists lead_search_runs_finished_idx
on public.lead_search_runs(finished_at desc);

alter table if exists public.lead_search_runs enable row level security;

drop policy if exists "lead_search_runs_admin_all" on public.lead_search_runs;
create policy "lead_search_runs_admin_all"
on public.lead_search_runs
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "lead_search_runs_service_role_all" on public.lead_search_runs;
create policy "lead_search_runs_service_role_all"
on public.lead_search_runs
for all
to service_role
using (true)
with check (true);

