-- LeadGen RLS: restrict to service_role and authenticated admins (crm_is_admin)

-- Leads
alter table if exists public.leads enable row level security;
drop policy if exists "leads_admin_all" on public.leads;
create policy "leads_admin_all" on public.leads
  for all to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

drop policy if exists "leads_service_role_all" on public.leads;
create policy "leads_service_role_all" on public.leads
  for all to service_role
  using (true)
  with check (true);

-- Lead events
alter table if exists public.lead_events enable row level security;
drop policy if exists "lead_events_admin_all" on public.lead_events;
create policy "lead_events_admin_all" on public.lead_events
  for all to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

drop policy if exists "lead_events_service_role_all" on public.lead_events;
create policy "lead_events_service_role_all" on public.lead_events
  for all to service_role
  using (true)
  with check (true);

-- Lead groups
alter table if exists public.lead_groups enable row level security;
drop policy if exists "lead_groups_admin_all" on public.lead_groups;
create policy "lead_groups_admin_all" on public.lead_groups
  for all to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

drop policy if exists "lead_groups_service_role_all" on public.lead_groups;
create policy "lead_groups_service_role_all" on public.lead_groups
  for all to service_role
  using (true)
  with check (true);

-- Lead group members
alter table if exists public.lead_group_members enable row level security;
drop policy if exists "lead_group_members_admin_all" on public.lead_group_members;
create policy "lead_group_members_admin_all" on public.lead_group_members
  for all to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

drop policy if exists "lead_group_members_service_role_all" on public.lead_group_members;
create policy "lead_group_members_service_role_all" on public.lead_group_members
  for all to service_role
  using (true)
  with check (true);

-- Lead filters registry
alter table if exists public.lead_filters enable row level security;
drop policy if exists "lead_filters_admin_all" on public.lead_filters;
create policy "lead_filters_admin_all" on public.lead_filters
  for all to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

drop policy if exists "lead_filters_service_role_all" on public.lead_filters;
create policy "lead_filters_service_role_all" on public.lead_filters
  for all to service_role
  using (true)
  with check (true);

-- Lead filter results
alter table if exists public.lead_filter_results enable row level security;
drop policy if exists "lead_filter_results_admin_all" on public.lead_filter_results;
create policy "lead_filter_results_admin_all" on public.lead_filter_results
  for all to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

drop policy if exists "lead_filter_results_service_role_all" on public.lead_filter_results;
create policy "lead_filter_results_service_role_all" on public.lead_filter_results
  for all to service_role
  using (true)
  with check (true);

