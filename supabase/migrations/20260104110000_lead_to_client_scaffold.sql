-- Lead→Client scaffolding and minimal project tasks
-- - Adds crm_clients.lead_id and domain for linkage/idempotency
-- - Adds crm_projects.bundle_key and notes
-- - Creates crm_project_tasks with simple checklist support

create extension if not exists "pgcrypto";

-- Link a CRM client back to a lead (optional, unique)
alter table if exists public.crm_clients
  add column if not exists lead_id uuid unique null;

-- Store a normalized domain on clients to aid de-duplication
alter table if exists public.crm_clients
  add column if not exists domain text null;

-- Ensure domain is unique when present (allow multiple nulls)
create unique index if not exists crm_clients_domain_uq
  on public.crm_clients((lower(domain)))
  where domain is not null;

-- Projects: remember chosen bundle and freeform notes
alter table if exists public.crm_projects
  add column if not exists bundle_key text null,
  add column if not exists notes text null;

-- Minimal project tasks (separate from list/items for a simple checklist)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'crm_task_status') then
    create type public.crm_task_status as enum ('todo','doing','done');
  end if;
end $$;

create table if not exists public.crm_project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.crm_projects(id) on delete cascade,
  title text not null,
  status public.crm_task_status not null default 'todo',
  sort int null,
  created_at timestamptz not null default now()
);

alter table public.crm_project_tasks enable row level security;

-- Admins (authenticated via crm_is_admin) can do everything
drop policy if exists "crm_project_tasks_admin_all" on public.crm_project_tasks;
create policy "crm_project_tasks_admin_all"
on public.crm_project_tasks
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

-- Clients can read tasks for their projects
drop policy if exists "crm_project_tasks_client_read" on public.crm_project_tasks;
create policy "crm_project_tasks_client_read"
on public.crm_project_tasks
for select
to authenticated
using (
  exists (
    select 1
    from public.crm_projects p
    join public.crm_client_users cu
      on cu.client_id = p.client_id
     and cu.user_id = auth.uid()
    where p.id = crm_project_tasks.project_id
  )
);

-- Service role bypass
drop policy if exists "crm_project_tasks_service_role_all" on public.crm_project_tasks;
create policy "crm_project_tasks_service_role_all"
on public.crm_project_tasks
for all
to service_role
using (true)
with check (true);

create index if not exists crm_project_tasks_project_idx
on public.crm_project_tasks(project_id);

