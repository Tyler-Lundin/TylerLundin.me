-- Projects foundation: projects, memberships, roles, invoices/payments (minimal)

create extension if not exists pgcrypto;

-- ============================
-- Enums
-- ============================
create type public.project_status as enum ('draft','active','on_hold','completed','archived');
create type public.project_role as enum ('owner','client','collaborator','viewer');
create type public.invoice_status as enum ('draft','open','paid','void','uncollectible');

-- ============================
-- projects
-- ============================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text null,
  status public.project_status not null default 'draft',
  owner_user_id uuid null references public.users(id) on delete set null,
  client_user_id uuid null references public.users(id) on delete set null,
  budget_cents bigint null,
  currency text null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_status_idx on public.projects(status);
create index projects_owner_idx on public.projects(owner_user_id);
create index projects_client_idx on public.projects(client_user_id);

alter table public.projects enable row level security;

-- Public read is disabled; allow only authenticated members and service_role
drop policy if exists "projects_service_role_all" on public.projects;
create policy "projects_service_role_all" on public.projects for all to service_role using (true) with check (true);

-- ============================
-- project_memberships (many-to-many with role)
-- ============================
create table public.project_memberships (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.project_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index project_memberships_user_idx on public.project_memberships(user_id);

alter table public.project_memberships enable row level security;
drop policy if exists "project_memberships_service_role_all" on public.project_memberships;
create policy "project_memberships_service_role_all" on public.project_memberships for all to service_role using (true) with check (true);

-- Member read access to their memberships
drop policy if exists "project_memberships_member_select" on public.project_memberships;
create policy "project_memberships_member_select" on public.project_memberships
  for select to authenticated using (auth.uid()::text = user_id::text);

-- ============================
-- invoices (minimal)
-- ============================
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  number text unique,
  status public.invoice_status not null default 'draft',
  amount_cents bigint not null,
  currency text not null default 'USD',
  due_at timestamptz null,
  meta jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invoices_project_idx on public.invoices(project_id);
create index invoices_status_idx on public.invoices(status);

alter table public.invoices enable row level security;
drop policy if exists "invoices_service_role_all" on public.invoices;
create policy "invoices_service_role_all" on public.invoices for all to service_role using (true) with check (true);

-- ============================
-- payments (minimal ledger of events)
-- ============================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount_cents bigint not null,
  currency text not null default 'USD',
  provider text null,
  provider_ref text null,
  status text null,
  created_at timestamptz not null default now()
);

create index payments_invoice_idx on public.payments(invoice_id);

alter table public.payments enable row level security;
drop policy if exists "payments_service_role_all" on public.payments;
create policy "payments_service_role_all" on public.payments for all to service_role using (true) with check (true);

-- ============================
-- Helper: allow project members to read their projects
-- ============================
drop policy if exists "projects_member_select" on public.projects;
create policy "projects_member_select" on public.projects
  for select to authenticated
  using (
    exists (
      select 1 from public.project_memberships m
      where m.project_id = projects.id and m.user_id::text = auth.uid()::text
    )
  );

-- Updated_at trigger on projects and invoices
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects for each row execute function public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices for each row execute function public.set_updated_at();

