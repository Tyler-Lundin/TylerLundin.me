-- AI Tasks table for remote execution
create table if not exists public.crm_ai_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.crm_projects(id) on delete cascade,
  template_id text null, -- references code-defined template ID
  title text not null,
  description text null,
  status text not null default 'queued', -- queued, running, review, success, failed
  inputs jsonb null, -- inputs provided for the task
  branch_name text null,
  pr_url text null,
  run_id text null, -- GitHub Action Run ID
  logs jsonb null, -- Simple log array or summary
  created_by uuid not null references public.crm_profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_ai_tasks enable row level security;

-- Admin: Full Access
create policy "crm_ai_tasks_admin_all"
on public.crm_ai_tasks
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

-- Client: Read Only if visible (future proofing, though currently dev-only)
create policy "crm_ai_tasks_client_read"
on public.crm_ai_tasks
for select
to authenticated
using (
  exists (
    select 1
    from public.crm_projects p
    join public.crm_client_users cu
      on cu.client_id = p.client_id
     and cu.user_id = auth.uid()
    where p.id = crm_ai_tasks.project_id
  )
);

-- Service Role: Full Access
create policy "crm_ai_tasks_service_role_all"
on public.crm_ai_tasks
for all
to service_role
using (true)
with check (true);

-- Indexes
create index if not exists crm_ai_tasks_project_idx on public.crm_ai_tasks(project_id);
create index if not exists crm_ai_tasks_status_idx on public.crm_ai_tasks(status);
