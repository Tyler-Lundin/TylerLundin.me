-- Audit logs for team member actions and admin operations
create extension if not exists "pgcrypto";

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  route text,
  action text,
  method text,
  status int,
  actor_id uuid,
  actor_email text,
  actor_role text,
  ip text,
  user_agent text,
  payload jsonb,
  result jsonb,
  error text
);

create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_route_idx on public.audit_logs(route);

alter table if exists public.audit_logs enable row level security;
drop policy if exists "audit_logs_admin_all" on public.audit_logs;
create policy "audit_logs_admin_all" on public.audit_logs
  for all to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

drop policy if exists "audit_logs_service_role_all" on public.audit_logs;
create policy "audit_logs_service_role_all" on public.audit_logs
  for all to service_role
  using (true)
  with check (true);

