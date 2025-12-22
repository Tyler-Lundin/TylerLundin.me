-- Team invites and credentials
create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'member',
  message text,
  invite_key text not null,
  status text not null default 'pending', -- pending | accepted | expired | revoked
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  accepted_at timestamptz
);

create index if not exists team_invites_email_idx on public.team_invites(email);
create index if not exists team_invites_status_idx on public.team_invites(status);

-- Per-user triple password credentials
create table if not exists public.team_credentials (
  user_id uuid primary key,
  password_1_hash text not null,
  password_2_hash text not null,
  password_3_hash text not null,
  created_at timestamptz not null default now()
);

-- Optional: ensure only valid statuses
create or replace function public.team_invites_enforce_status()
returns trigger as $$
begin
  if NEW.status not in ('pending','accepted','expired','revoked') then
    raise exception 'Invalid status % for team_invites', NEW.status;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_team_invites_status on public.team_invites;
create trigger trg_team_invites_status
before insert or update on public.team_invites
for each row execute function public.team_invites_enforce_status();

-- User profiles
create table if not exists public.user_profiles (
  user_id uuid primary key,
  headline text,
  bio text,
  avatar_url text,
  socials jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
