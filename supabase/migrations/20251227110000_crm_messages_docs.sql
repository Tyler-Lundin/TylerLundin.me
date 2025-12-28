-- Project Messages and Documents

-- ============================
-- crm_project_messages
-- ============================
create table if not exists public.crm_project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.crm_projects(id) on delete cascade,
  author_role text not null check (author_role in ('admin', 'client')),
  author_name text not null,
  text text not null,
  attachments jsonb, -- array of { id, url, name, type }
  created_at timestamptz not null default now()
);

alter table public.crm_project_messages enable row level security;

-- Admin full access
drop policy if exists "crm_project_messages_admin_all" on public.crm_project_messages;
create policy "crm_project_messages_admin_all"
  on public.crm_project_messages
  for all
  to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

-- Client access to their project messages
drop policy if exists "crm_project_messages_client_read" on public.crm_project_messages;
create policy "crm_project_messages_client_read"
  on public.crm_project_messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.crm_projects p
      join public.crm_client_users cu on cu.client_id = p.client_id
      where p.id = crm_project_messages.project_id and cu.user_id = auth.uid()
    )
  );

-- Service role full access
drop policy if exists "crm_project_messages_service_role_all" on public.crm_project_messages;
create policy "crm_project_messages_service_role_all"
  on public.crm_project_messages
  for all
  to service_role
  using (true)
  with check (true);


-- ============================
-- crm_project_documents
-- ============================
create table if not exists public.crm_project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.crm_projects(id) on delete cascade,
  kind text not null check (kind in ('contract', 'sow', 'nda', 'other')),
  title text not null,
  status text not null check (status in ('signed', 'pending', 'draft')),
  url text,
  meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_project_documents enable row level security;

-- Admin full access
drop policy if exists "crm_project_documents_admin_all" on public.crm_project_documents;
create policy "crm_project_documents_admin_all"
  on public.crm_project_documents
  for all
  to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

-- Client read access
drop policy if exists "crm_project_documents_client_read" on public.crm_project_documents;
create policy "crm_project_documents_client_read"
  on public.crm_project_documents
  for select
  to authenticated
  using (
    exists (
      select 1 from public.crm_projects p
      join public.crm_client_users cu on cu.client_id = p.client_id
      where p.id = crm_project_documents.project_id and cu.user_id = auth.uid()
    )
  );

-- Service role full access
drop policy if exists "crm_project_documents_service_role_all" on public.crm_project_documents;
create policy "crm_project_documents_service_role_all"
  on public.crm_project_documents
  for all
  to service_role
  using (true)
  with check (true);

-- Trigger for updated_at
drop trigger if exists crm_project_documents_set_updated_at on public.crm_project_documents;
create trigger crm_project_documents_set_updated_at
  before update on public.crm_project_documents
  for each row execute function public.set_updated_at();
