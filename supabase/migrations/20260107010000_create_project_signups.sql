-- Create project_signups table for public submissions
create table if not exists project_signups (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  company_website text,
  contact_name text not null,
  contact_email text not null,
  project_description text,
  promo_code text,
  need_logo boolean default false,
  status text default 'pending', -- pending, processed, rejected
  created_at timestamptz default now()
);

-- Enable RLS
alter table project_signups enable row level security;

-- Policies
-- Public can insert (Start Now wizard)
create policy "Public can insert signups" on project_signups
  for insert with check (true);

-- Only admins can view/update
create policy "Admins can manage signups" on project_signups
  for all using (
    exists (
      select 1 from users 
      where id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Allow users to view their own signups based on email
create policy "Users can view own signups" on project_signups
  for select using (
    contact_email = (select auth.jwt() ->> 'email')
  );