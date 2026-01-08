-- Replace 'projects' with 'crm_projects' dependency for invoices
-- and remove 'projects' and 'project_memberships'

-- 1. Truncate invoices and payments to avoid FK violations during re-pointing
truncate table public.payments cascade;
truncate table public.invoices cascade;

-- 2. Drop constraints and policies that block dropping the tables
drop policy if exists "projects_member_select" on public.projects;
alter table if exists public.invoices drop constraint if exists invoices_project_id_fkey;

-- 3. Drop old tables
drop table if exists public.project_memberships;
drop table if exists public.projects;

-- 4. Re-point invoices to crm_projects
alter table public.invoices
  add constraint invoices_project_id_fkey
  foreign key (project_id) references public.crm_projects(id) on delete cascade;

-- 5. Update RLS for Invoices (use crm logic)
drop policy if exists "invoices_admin_all" on public.invoices;
create policy "invoices_admin_all"
on public.invoices
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "invoices_client_read" on public.invoices;
create policy "invoices_client_read"
on public.invoices
for select
to authenticated
using (
  exists (
    select 1
    from public.crm_projects p
    join public.crm_client_users cu
      on cu.client_id = p.client_id
     and cu.user_id = auth.uid()
    where p.id = invoices.project_id
  )
);

-- 6. Update RLS for Payments
drop policy if exists "payments_admin_all" on public.payments;
create policy "payments_admin_all"
on public.payments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "payments_client_read" on public.payments;
create policy "payments_client_read"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.invoices i
    join public.crm_projects p on p.id = i.project_id
    join public.crm_client_users cu
      on cu.client_id = p.client_id
     and cu.user_id = auth.uid()
    where i.id = payments.invoice_id
  )
);