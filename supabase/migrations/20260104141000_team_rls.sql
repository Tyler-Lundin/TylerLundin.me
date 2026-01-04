-- Enable RLS and define policies for team tables and user profiles

-- team_invites: restrict to service role by default
alter table if exists public.team_invites enable row level security;

drop policy if exists "team_invites_service_role_all" on public.team_invites;
create policy "team_invites_service_role_all"
on public.team_invites
for all to service_role
using (true)
with check (true);

-- team_credentials: restrict to service role only
alter table if exists public.team_credentials enable row level security;

drop policy if exists "team_credentials_service_role_all" on public.team_credentials;
create policy "team_credentials_service_role_all"
on public.team_credentials
for all to service_role
using (true)
with check (true);

-- user_profiles: self-access for authenticated users, full for service role
alter table if exists public.user_profiles enable row level security;

drop policy if exists "user_profiles_self_rw" on public.user_profiles;
create policy "user_profiles_self_rw"
on public.user_profiles
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_profiles_service_role_all" on public.user_profiles;
create policy "user_profiles_service_role_all"
on public.user_profiles
for all to service_role
using (true)
with check (true);

