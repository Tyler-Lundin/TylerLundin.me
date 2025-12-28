-- Health runs history for projects

-- Create enum for health status if missing
do $$
begin
  if not exists (select 1 from pg_type where typname = 'crm_health_status') then
    create type crm_health_status as enum ('ok','warn','error','pending');
  end if;
end$$;

create table if not exists public.crm_project_health_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.crm_projects(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  overall_status crm_health_status not null,
  items jsonb not null,
  endpoint_url text,
  error text
);

create index if not exists idx_health_runs_project on public.crm_project_health_runs(project_id);
create index if not exists idx_health_runs_started_at on public.crm_project_health_runs(started_at desc);

comment on table public.crm_project_health_runs is 'Historical records of health checks per project';
comment on column public.crm_project_health_runs.items is 'Array of normalized health items returned by the project endpoint';

