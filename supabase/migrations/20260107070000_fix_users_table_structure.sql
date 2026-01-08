-- Fix public.users table structure and trigger robustness

-- 1. Remove default from ID if it exists (it should come from auth.users)
alter table public.users alter column id drop default;

-- 2. Ensure ID references auth.users
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where table_name = 'users' and constraint_type = 'FOREIGN KEY'
  ) then
    alter table public.users
    add constraint users_id_fkey foreign key (id) references auth.users(id) on delete cascade;
  end if;
end $$;

-- 3. Make email nullable and drop unique constraint (auth.users handles uniqueness)
alter table public.users alter column email drop not null;
alter table public.users drop constraint if exists users_email_key;

-- 4. Update the trigger function to be more robust (upsert instead of insert)
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
    'guest', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.users.full_name, excluded.full_name),
    avatar_url = coalesce(public.users.avatar_url, excluded.avatar_url),
    updated_at = now();
    
  return new;
end;
$$;
