-- Create user_roles table
create table if not exists user_roles (
  user_id uuid references auth.users not null primary key,
  role text not null default 'viewer',
  created_at timestamptz default now()
);

-- Enable RLS
alter table user_roles enable row level security;

-- Policies
create policy "Users can read own role" on user_roles
  for select using (auth.uid() = user_id);

create policy "Admins can manage roles" on user_roles
  for all using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

-- Migrate data from public.users if possible
-- Only migrate users that exist in auth.users to avoid FK violations
insert into user_roles (user_id, role)
select u.id, u.role 
from public.users u
join auth.users au on u.id = au.id
where u.role is not null
on conflict (user_id) do update set role = excluded.role;

-- Drop obsolete tables
drop table if exists team_credentials;
drop table if exists admin_passwords;

-- Drop role column from users (optional, but cleaner to rely on user_roles)
-- alter table users drop column role; 
-- Keeping it for now to avoid breaking other queries immediately, but we will switch auth.ts to use user_roles.
