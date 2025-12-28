-- Enhancements for CRM Services, Bundles, and Activity Log

-- ==============================================================================
-- 1. Updates to crm_services to match Zod schema and support /dev/services
-- ==============================================================================

-- Rename columns to match application terminology (slug/title/summary)
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'crm_services' and column_name = 'key') then
    alter table public.crm_services rename column key to slug;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'crm_services' and column_name = 'name') then
    alter table public.crm_services rename column name to title;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'crm_services' and column_name = 'description') then
    alter table public.crm_services rename column description to summary;
  end if;
end $$;

-- Add new columns required by the Services page
alter table public.crm_services
  add column if not exists category text,
  add column if not exists status text default 'active',
  add column if not exists tags text[],
  add column if not exists features text[],
  add column if not exists price_range text,
  add column if not exists cta_label text,
  add column if not exists cta_href text,
  add column if not exists updated_at timestamptz default now();

-- Migrate old is_active boolean to new status text if is_active still exists
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'crm_services' and column_name = 'is_active') then
    update public.crm_services set status = 'active' where is_active = true;
    update public.crm_services set status = 'hidden' where is_active = false;
    alter table public.crm_services drop column is_active;
  end if;
end $$;


-- ==============================================================================
-- 2. Create crm_bundles table
-- ==============================================================================

create table if not exists public.crm_bundles (
  slug text primary key,
  title text not null,
  summary text not null,
  price_range text,
  prices jsonb, -- array of { amount, currency, cadence, note }
  billing text, -- 'monthly', 'one_time', 'project'
  features text[],
  tags text[],
  cta_label text,
  cta_href text,
  status text default 'active',
  bg_img text,
  class_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for crm_bundles
alter table public.crm_bundles enable row level security;

-- Admin can do everything
drop policy if exists "crm_bundles_admin_all" on public.crm_bundles;
create policy "crm_bundles_admin_all" on public.crm_bundles 
  for all to authenticated 
  using (public.crm_is_admin()) 
  with check (public.crm_is_admin());

-- Public can read active bundles
drop policy if exists "crm_bundles_public_read" on public.crm_bundles;
create policy "crm_bundles_public_read" on public.crm_bundles 
  for select to anon 
  using (status = 'active');

-- Service role full access
drop policy if exists "crm_bundles_service_role_all" on public.crm_bundles;
create policy "crm_bundles_service_role_all" on public.crm_bundles 
  for all to service_role 
  using (true) 
  with check (true);


-- ==============================================================================
-- 3. Create crm_bundle_services (Join Table)
-- ==============================================================================

create table if not exists public.crm_bundle_services (
  bundle_slug text not null references public.crm_bundles(slug) on delete cascade,
  service_slug text not null references public.crm_services(slug) on delete cascade,
  primary key (bundle_slug, service_slug)
);

-- RLS for crm_bundle_services
alter table public.crm_bundle_services enable row level security;

drop policy if exists "crm_bundle_services_admin_all" on public.crm_bundle_services;
create policy "crm_bundle_services_admin_all" on public.crm_bundle_services 
  for all to authenticated 
  using (public.crm_is_admin()) 
  with check (public.crm_is_admin());

drop policy if exists "crm_bundle_services_public_read" on public.crm_bundle_services;
create policy "crm_bundle_services_public_read" on public.crm_bundle_services 
  for select to anon 
  using (true); 

drop policy if exists "crm_bundle_services_service_role_all" on public.crm_bundle_services;
create policy "crm_bundle_services_service_role_all" on public.crm_bundle_services 
  for all to service_role 
  using (true) 
  with check (true);


-- ==============================================================================
-- 4. Create crm_activity_log for the Dashboard Feed
-- ==============================================================================

create table if not exists public.crm_activity_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.crm_projects(id) on delete set null,
  client_id uuid references public.crm_clients(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null, -- Actor
  action_type text not null, -- 'deploy', 'money', 'edit', 'create', etc.
  description text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- RLS for crm_activity_log
alter table public.crm_activity_log enable row level security;

drop policy if exists "crm_activity_log_admin_all" on public.crm_activity_log;
create policy "crm_activity_log_admin_all" on public.crm_activity_log 
  for all to authenticated 
  using (public.crm_is_admin()) 
  with check (public.crm_is_admin());

drop policy if exists "crm_activity_log_service_role_all" on public.crm_activity_log;
create policy "crm_activity_log_service_role_all" on public.crm_activity_log 
  for all to service_role 
  using (true) 
  with check (true);
