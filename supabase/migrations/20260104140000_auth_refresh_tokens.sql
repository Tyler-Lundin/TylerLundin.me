-- Refresh token store for rotating sessions
create extension if not exists "pgcrypto";

create table if not exists public.auth_refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  user_agent text,
  ip text
);

create index if not exists auth_rt_user_idx on public.auth_refresh_tokens(user_id);
create index if not exists auth_rt_expires_idx on public.auth_refresh_tokens(expires_at);

alter table if exists public.auth_refresh_tokens enable row level security;
drop policy if exists "auth_rt_admin_all" on public.auth_refresh_tokens;
create policy "auth_rt_admin_all" on public.auth_refresh_tokens
  for all to service_role
  using (true)
  with check (true);

