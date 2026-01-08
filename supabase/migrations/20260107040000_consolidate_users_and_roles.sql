-- Consolidate users and roles into public.users
-- and set up sync triggers with auth.users

-- 1. Ensure public.users exists and has the right schema
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'guest',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on public.users
alter table public.users enable row level security;

-- Policies for public.users
drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile" 
  on public.users for select 
  using (auth.uid() = id);

drop policy if exists "Admins can manage all profiles" on public.users;
create policy "Admins can manage all profiles" 
  on public.users for all 
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- 2. Migrate data from auth.users (Sync base users)
insert into public.users (id, email, created_at)
select id, email, created_at
from auth.users
on conflict (id) do update 
set email = excluded.email;

-- 3. Migrate roles from user_roles (if exists)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'user_roles') then
    update public.users u
    set role = ur.role
    from user_roles ur
    where u.id = ur.user_id;
  end if;
end $$;

-- 4. Migrate roles from crm_profiles (priority over user_roles if admin)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'crm_profiles') then
    update public.users u
    set role = 'admin'
    from crm_profiles cp
    where u.id = cp.user_id 
    and cp.role = 'admin'::public.crm_role; -- cast if necessary
  end if;
end $$;

-- 5. Handle FK dependencies before dropping old tables

-- Drop FKs from crm_client_users
alter table if exists public.crm_client_users
  drop constraint if exists crm_client_users_user_id_fkey, -- standard name guess
  drop constraint if exists crm_client_users_user_id_fkey1, -- potential generated name
  drop constraint if exists crm_profiles_user_fk; -- from crm_profiles definition

-- Re-point crm_client_users to public.users
-- First ensure data integrity: delete orphans if any (shouldn't be thanks to cascade, but good to be safe)
delete from public.crm_client_users 
where user_id not in (select id from public.users);

alter table public.crm_client_users
  add constraint crm_client_users_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

-- Re-point crm_project_notes
alter table if exists public.crm_project_notes
  drop constraint if exists crm_project_notes_author_id_fkey;

alter table public.crm_project_notes
  add constraint crm_project_notes_author_id_fkey
  foreign key (author_id) references public.users(id) on delete cascade;

-- Re-point crm_client_notes
alter table if exists public.crm_client_notes
  drop constraint if exists crm_client_notes_author_id_fkey;

alter table public.crm_client_notes
  add constraint crm_client_notes_author_id_fkey
  foreign key (author_id) references public.users(id) on delete cascade;
  
-- Re-point crm_project_list_items
alter table if exists public.crm_project_list_items
  drop constraint if exists crm_project_list_items_assignee_user_id_fkey;

alter table public.crm_project_list_items
  add constraint crm_project_list_items_assignee_user_id_fkey
  foreign key (assignee_user_id) references public.users(id) on delete set null;

-- Re-point crm_ai_tasks
alter table if exists public.crm_ai_tasks
  drop constraint if exists crm_ai_tasks_created_by_fkey;

alter table public.crm_ai_tasks
  add constraint crm_ai_tasks_created_by_fkey
  foreign key (created_by) references public.users(id) on delete cascade;


-- 6. Drop old tables
drop table if exists public.user_roles;
drop table if exists public.crm_profiles;


-- 7. Create Trigger Function for syncing auth.users -> public.users
create or replace function public.handle_new_user() 
returns trigger 
language plpgsql 
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, role, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    'guest', -- Default role
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- 8. Create Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 9. Create Trigger Function for auto-assigning 'client' role
create or replace function public.handle_client_membership_added()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Update the user's role to 'client' ONLY IF they are currently 'guest'
  -- We don't want to downgrade an 'admin' or 'owner' to 'client' just because they were added to a project.
  update public.users
  set role = 'client'
  where id = new.user_id
  and role = 'guest';
  
  return new;
end;
$$;

-- 10. Create Trigger on crm_client_users
drop trigger if exists on_client_membership_added on public.crm_client_users;
create trigger on_client_membership_added
  after insert on public.crm_client_users
  for each row execute procedure public.handle_client_membership_added();

-- 11. Helper function for backward compatibility or ease of use (optional)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.users
    where id = auth.uid() and role in ('admin', 'owner')
  );
$$;