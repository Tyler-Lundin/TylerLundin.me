-- Dev CRM schema (prefixed with crm_ to avoid conflicts)
-- Next.js + Supabase (RLS-first), invite-only/passwordless-ready
-- Includes: clients, contacts, projects, services, links, lists/items, notes, memberships, profiles, invitations, public_links + resolver RPC

-- ============================
-- Extensions
-- ============================
create extension if not exists pgcrypto;

-- ============================
-- Enums
-- ============================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'crm_project_status') then
    create type public.crm_project_status as enum ('planned','in_progress','paused','completed','archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'crm_priority') then
    create type public.crm_priority as enum ('low','normal','high','urgent');
  end if;

  if not exists (select 1 from pg_type where typname = 'crm_link_type') then
    create type public.crm_link_type as enum ('live','staging','repo','docs','design','tracker','other');
  end if;

  if not exists (select 1 from pg_type where typname = 'crm_list_key') then
    create type public.crm_list_key as enum ('goals','bugs','tasks','custom');
  end if;

  if not exists (select 1 from pg_type where typname = 'crm_item_status') then
    create type public.crm_item_status as enum ('open','in_progress','done');
  end if;

  if not exists (select 1 from pg_type where typname = 'crm_role') then
    create type public.crm_role as enum ('admin','client');
  end if;

  if not exists (select 1 from pg_type where typname = 'crm_client_user_role') then
    create type public.crm_client_user_role as enum ('owner','stakeholder','viewer');
  end if;
end $$;

-- ============================
-- profiles (maps auth.users -> role/email/name)
-- ============================
create table if not exists public.crm_profiles (
  user_id uuid primary key,
  email text not null,
  name text null,
  role public.crm_role not null,
  created_at timestamptz not null default now(),
  constraint crm_profiles_user_fk foreign key (user_id) references auth.users(id) on delete cascade
);

alter table public.crm_profiles enable row level security;

-- Helper: admin check (SECURITY DEFINER to avoid RLS recursion when used in policies)
create or replace function public.crm_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.crm_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  );
$$;

-- Tighten function privileges
revoke all on function public.crm_is_admin() from public;
grant execute on function public.crm_is_admin() to authenticated;

-- Policies: profiles
drop policy if exists "crm_profiles_admin_all" on public.crm_profiles;
create policy "crm_profiles_admin_all"
on public.crm_profiles
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_profiles_self_read" on public.crm_profiles;
create policy "crm_profiles_self_read"
on public.crm_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "crm_profiles_service_role_all" on public.crm_profiles;
create policy "crm_profiles_service_role_all"
on public.crm_profiles
for all
to service_role
using (true)
with check (true);

-- ============================
-- clients
-- ============================
create table if not exists public.crm_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text null,
  website_url text null,
  phone text null,
  billing_notes text null,
  created_at timestamptz not null default now()
);

alter table public.crm_clients enable row level security;

drop policy if exists "crm_clients_admin_all" on public.crm_clients;
create policy "crm_clients_admin_all"
on public.crm_clients
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

-- Note: member read policy added after crm_client_users is created (see later section)

drop policy if exists "crm_clients_service_role_all" on public.crm_clients;
create policy "crm_clients_service_role_all"
on public.crm_clients
for all
to service_role
using (true)
with check (true);

-- ============================
-- client_contacts (optional MVP-lite)
-- ============================
create table if not exists public.crm_client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients(id) on delete cascade,
  name text not null,
  email text null,
  phone text null,
  title text null,
  created_at timestamptz not null default now()
);

alter table public.crm_client_contacts enable row level security;

drop policy if exists "crm_client_contacts_admin_all" on public.crm_client_contacts;
create policy "crm_client_contacts_admin_all"
on public.crm_client_contacts
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_client_contacts_service_role_all" on public.crm_client_contacts;
create policy "crm_client_contacts_service_role_all"
on public.crm_client_contacts
for all
to service_role
using (true)
with check (true);

create index if not exists crm_client_contacts_client_idx
on public.crm_client_contacts(client_id);

-- ============================
-- client_users (membership)
-- ============================
create table if not exists public.crm_client_users (
  client_id uuid not null references public.crm_clients(id) on delete cascade,
  user_id uuid not null references public.crm_profiles(user_id) on delete cascade,
  role public.crm_client_user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (client_id, user_id)
);

alter table public.crm_client_users enable row level security;

drop policy if exists "crm_client_users_admin_all" on public.crm_client_users;
create policy "crm_client_users_admin_all"
on public.crm_client_users
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_client_users_member_read" on public.crm_client_users;
create policy "crm_client_users_member_read"
on public.crm_client_users
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "crm_client_users_service_role_all" on public.crm_client_users;
create policy "crm_client_users_service_role_all"
on public.crm_client_users
for all
to service_role
using (true)
with check (true);

create index if not exists crm_client_users_user_idx
on public.crm_client_users(user_id);

-- Speed up lookups by client
create index if not exists crm_client_users_client_idx
on public.crm_client_users(client_id);

-- Now that crm_client_users exists, add member read policy on clients
drop policy if exists "crm_clients_member_read" on public.crm_clients;
create policy "crm_clients_member_read"
on public.crm_clients
for select
to authenticated
using (
  exists (
    select 1
    from public.crm_client_users cu
    where cu.client_id = crm_clients.id
      and cu.user_id = auth.uid()
  )
);

-- ============================
-- services (catalog)
-- ============================
create table if not exists public.crm_services (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.crm_services enable row level security;

drop policy if exists "crm_services_admin_all" on public.crm_services;
create policy "crm_services_admin_all"
on public.crm_services
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_services_service_role_all" on public.crm_services;
create policy "crm_services_service_role_all"
on public.crm_services
for all
to service_role
using (true)
with check (true);

-- ============================
-- projects
-- ============================
create table if not exists public.crm_projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text null,
  status public.crm_project_status not null default 'planned',
  priority public.crm_priority not null default 'normal',
  started_at date null,
  due_at date null,
  ended_at date null,
  created_at timestamptz not null default now()
);

alter table public.crm_projects enable row level security;

drop policy if exists "crm_projects_admin_all" on public.crm_projects;
create policy "crm_projects_admin_all"
on public.crm_projects
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_projects_client_read" on public.crm_projects;
create policy "crm_projects_client_read"
on public.crm_projects
for select
to authenticated
using (
  exists (
    select 1
    from public.crm_client_users cu
    where cu.client_id = crm_projects.client_id
      and cu.user_id = auth.uid()
  )
);

drop policy if exists "crm_projects_service_role_all" on public.crm_projects;
create policy "crm_projects_service_role_all"
on public.crm_projects
for all
to service_role
using (true)
with check (true);

create index if not exists crm_projects_client_idx
on public.crm_projects(client_id);

create index if not exists crm_projects_status_idx
on public.crm_projects(status);

-- ============================
-- project_services (join)
-- ============================
create table if not exists public.crm_project_services (
  project_id uuid not null references public.crm_projects(id) on delete cascade,
  service_id uuid not null references public.crm_services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, service_id)
);

alter table public.crm_project_services enable row level security;

drop policy if exists "crm_project_services_admin_all" on public.crm_project_services;
create policy "crm_project_services_admin_all"
on public.crm_project_services
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_project_services_service_role_all" on public.crm_project_services;
create policy "crm_project_services_service_role_all"
on public.crm_project_services
for all
to service_role
using (true)
with check (true);

create index if not exists crm_project_services_project_idx
on public.crm_project_services(project_id);

-- ============================
-- project_links (artifacts/urls)
-- ============================
create table if not exists public.crm_project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.crm_projects(id) on delete cascade,
  type public.crm_link_type not null,
  url text not null,
  label text null,
  meta jsonb null,
  is_client_visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.crm_project_links enable row level security;

drop policy if exists "crm_project_links_admin_all" on public.crm_project_links;
create policy "crm_project_links_admin_all"
on public.crm_project_links
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_project_links_client_read" on public.crm_project_links;
create policy "crm_project_links_client_read"
on public.crm_project_links
for select
to authenticated
using (
  is_client_visible = true
  and exists (
    select 1
    from public.crm_projects p
    join public.crm_client_users cu
      on cu.client_id = p.client_id
     and cu.user_id = auth.uid()
    where p.id = crm_project_links.project_id
  )
);

drop policy if exists "crm_project_links_service_role_all" on public.crm_project_links;
create policy "crm_project_links_service_role_all"
on public.crm_project_links
for all
to service_role
using (true)
with check (true);

create index if not exists crm_project_links_project_idx
on public.crm_project_links(project_id);

create index if not exists crm_project_links_visible_idx
on public.crm_project_links(is_client_visible);

-- ============================
-- project_lists
-- ============================
create table if not exists public.crm_project_lists (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.crm_projects(id) on delete cascade,
  key public.crm_list_key not null,
  title text not null,
  created_at timestamptz not null default now()
);

alter table public.crm_project_lists enable row level security;

drop policy if exists "crm_project_lists_admin_all" on public.crm_project_lists;
create policy "crm_project_lists_admin_all"
on public.crm_project_lists
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_project_lists_client_read" on public.crm_project_lists;
create policy "crm_project_lists_client_read"
on public.crm_project_lists
for select
to authenticated
using (
  exists (
    select 1
    from public.crm_projects p
    join public.crm_client_users cu
      on cu.client_id = p.client_id
     and cu.user_id = auth.uid()
    where p.id = crm_project_lists.project_id
  )
);

drop policy if exists "crm_project_lists_service_role_all" on public.crm_project_lists;
create policy "crm_project_lists_service_role_all"
on public.crm_project_lists
for all
to service_role
using (true)
with check (true);

create index if not exists crm_project_lists_project_idx
on public.crm_project_lists(project_id);

-- Enforce one list per (project_id, key) except for 'custom'
create unique index if not exists crm_project_lists_project_key_uq
on public.crm_project_lists(project_id, key)
where key <> 'custom'::public.crm_list_key;

-- ============================
-- project_list_items
-- ============================
create table if not exists public.crm_project_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.crm_project_lists(id) on delete cascade,
  title text not null,
  description text null,
  status public.crm_item_status not null default 'open',
  priority public.crm_priority not null default 'normal',
  assignee_user_id uuid null references public.crm_profiles(user_id) on delete set null,
  due_at date null,
  sort int null,
  is_client_visible boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.crm_project_list_items enable row level security;

drop policy if exists "crm_project_list_items_admin_all" on public.crm_project_list_items;
create policy "crm_project_list_items_admin_all"
on public.crm_project_list_items
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_project_list_items_client_read" on public.crm_project_list_items;
create policy "crm_project_list_items_client_read"
on public.crm_project_list_items
for select
to authenticated
using (
  is_client_visible = true
  and exists (
    select 1
    from public.crm_project_lists pl
    join public.crm_projects p on p.id = pl.project_id
    join public.crm_client_users cu
      on cu.client_id = p.client_id
     and cu.user_id = auth.uid()
    where pl.id = crm_project_list_items.list_id
  )
);

drop policy if exists "crm_project_list_items_service_role_all" on public.crm_project_list_items;
create policy "crm_project_list_items_service_role_all"
on public.crm_project_list_items
for all
to service_role
using (true)
with check (true);

create index if not exists crm_project_list_items_list_idx
on public.crm_project_list_items(list_id);

create index if not exists crm_project_list_items_visible_idx
on public.crm_project_list_items(is_client_visible);

-- ============================
-- project_notes
-- ============================
create table if not exists public.crm_project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.crm_projects(id) on delete cascade,
  author_id uuid not null references public.crm_profiles(user_id) on delete cascade,
  body text not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.crm_project_notes enable row level security;

drop policy if exists "crm_project_notes_admin_all" on public.crm_project_notes;
create policy "crm_project_notes_admin_all"
on public.crm_project_notes
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_project_notes_client_read" on public.crm_project_notes;
create policy "crm_project_notes_client_read"
on public.crm_project_notes
for select
to authenticated
using (
  is_private = false
  and exists (
    select 1
    from public.crm_projects p
    join public.crm_client_users cu
      on cu.client_id = p.client_id
     and cu.user_id = auth.uid()
    where p.id = crm_project_notes.project_id
  )
);

drop policy if exists "crm_project_notes_service_role_all" on public.crm_project_notes;
create policy "crm_project_notes_service_role_all"
on public.crm_project_notes
for all
to service_role
using (true)
with check (true);

create index if not exists crm_project_notes_project_idx
on public.crm_project_notes(project_id);

create index if not exists crm_project_notes_private_idx
on public.crm_project_notes(is_private);

-- ============================
-- client_notes
-- ============================
create table if not exists public.crm_client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients(id) on delete cascade,
  author_id uuid not null references public.crm_profiles(user_id) on delete cascade,
  body text not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.crm_client_notes enable row level security;

drop policy if exists "crm_client_notes_admin_all" on public.crm_client_notes;
create policy "crm_client_notes_admin_all"
on public.crm_client_notes
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_client_notes_client_read" on public.crm_client_notes;
create policy "crm_client_notes_client_read"
on public.crm_client_notes
for select
to authenticated
using (
  is_private = false
  and exists (
    select 1
    from public.crm_client_users cu
    where cu.client_id = crm_client_notes.client_id
      and cu.user_id = auth.uid()
  )
);

drop policy if exists "crm_client_notes_service_role_all" on public.crm_client_notes;
create policy "crm_client_notes_service_role_all"
on public.crm_client_notes
for all
to service_role
using (true)
with check (true);

create index if not exists crm_client_notes_client_idx
on public.crm_client_notes(client_id);

-- ============================
-- invitations (admin-managed gating)
-- ============================
create table if not exists public.crm_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null,
  role public.crm_role not null,
  client_id uuid null references public.crm_clients(id) on delete cascade,
  expires_at timestamptz not null,
  accepted_at timestamptz null,
  created_at timestamptz not null default now()
);

alter table public.crm_invitations enable row level security;

drop policy if exists "crm_invitations_admin_all" on public.crm_invitations;
create policy "crm_invitations_admin_all"
on public.crm_invitations
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_invitations_service_role_all" on public.crm_invitations;
create policy "crm_invitations_service_role_all"
on public.crm_invitations
for all
to service_role
using (true)
with check (true);

create index if not exists crm_invitations_email_idx
on public.crm_invitations(email);

create index if not exists crm_invitations_expires_idx
on public.crm_invitations(expires_at desc);

-- ============================
-- public_links (shareable pages: quote/onboarding/etc.)
-- Stored as token_hash; resolve via RPC for anon.
-- ============================
create table if not exists public.crm_public_links (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  type text not null,
  resource_id uuid not null,
  expires_at timestamptz null,
  created_at timestamptz not null default now()
);

alter table public.crm_public_links enable row level security;

drop policy if exists "crm_public_links_admin_all" on public.crm_public_links;
create policy "crm_public_links_admin_all"
on public.crm_public_links
for all
to authenticated
using (public.crm_is_admin())
with check (public.crm_is_admin());

drop policy if exists "crm_public_links_service_role_all" on public.crm_public_links;
create policy "crm_public_links_service_role_all"
on public.crm_public_links
for all
to service_role
using (true)
with check (true);

-- RPC to resolve public link by token (hash-compare), for anon access
create or replace function public.crm_public_link_resolve(p_token text)
returns table (
  id uuid,
  type text,
  resource_id uuid,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select l.id, l.type, l.resource_id, l.expires_at
  from public.crm_public_links l
  where (l.expires_at is null or l.expires_at > now())
    and l.token_hash = encode(digest(p_token, 'sha256'), 'hex');
end;
$$;

revoke all on function public.crm_public_link_resolve(text) from public;
grant execute on function public.crm_public_link_resolve(text) to anon, authenticated;

-- RPC to create a public link with server-side hashing of token
create or replace function public.crm_public_link_create(
  p_token text,
  p_type text,
  p_resource_id uuid,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- only admins may create public links
  if not public.crm_is_admin() then
    raise exception 'forbidden';
  end if;

  insert into public.crm_public_links (id, token_hash, type, resource_id, expires_at)
  values (
    gen_random_uuid(),
    encode(digest(p_token, 'sha256'), 'hex'),
    p_type,
    p_resource_id,
    p_expires_at
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.crm_public_link_create(text, text, uuid, timestamptz) from public;
grant execute on function public.crm_public_link_create(text, text, uuid, timestamptz) to authenticated, service_role;
