-- Enable RLS on crm_project_messages if not enabled
alter table crm_project_messages enable row level security;

-- Policy: Clients can view messages for their projects
create policy "Clients can view messages for their projects" on crm_project_messages
  for select using (
    exists (
      select 1 from crm_projects p
      join crm_client_users cu on p.client_id = cu.client_id
      where p.id = crm_project_messages.project_id
      and cu.user_id = auth.uid()
    )
  );

-- Policy: Clients can insert messages for their projects
create policy "Clients can insert messages for their projects" on crm_project_messages
  for insert with check (
    exists (
      select 1 from crm_projects p
      join crm_client_users cu on p.client_id = cu.client_id
      where p.id = crm_project_messages.project_id
      and cu.user_id = auth.uid()
    )
  );
