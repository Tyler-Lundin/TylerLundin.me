-- Add health monitoring fields to crm_projects
-- - project_health_url: External health endpoint this project exposes
-- - project_health_secret: Per-project shared secret (optional)
-- - project_health_enabled: Feature flag

alter table if exists public.crm_projects
  add column if not exists project_health_url text;

alter table if exists public.crm_projects
  add column if not exists project_health_secret text;

alter table if exists public.crm_projects
  add column if not exists project_health_enabled boolean not null default false;

comment on column public.crm_projects.project_health_url is 'External health endpoint for polling project health checks';
comment on column public.crm_projects.project_health_secret is 'Per-project shared secret used to authenticate polling requests';
comment on column public.crm_projects.project_health_enabled is 'Flag to enable/disable external health polling for this project';

