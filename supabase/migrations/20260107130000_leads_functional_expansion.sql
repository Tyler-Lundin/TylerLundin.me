-- Lead Notes and additional lead metadata

-- 1. Create Lead Notes table
create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable RLS
alter table public.lead_notes enable row level security;

-- 3. Policies
-- Admins can manage all notes
create policy "leads_notes_admin_all" on public.lead_notes
  for all to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

-- 4. Indices
create index idx_lead_notes_lead_id on public.lead_notes(lead_id);

-- 5. Trigger for updated_at
create trigger lead_notes_set_updated_at before update on public.lead_notes for each row execute function public.set_updated_at();

-- 6. Add strategy column to leads for storing AI generated pitch
alter table public.leads add column if not exists strategy jsonb;
