-- Fix missing columns and constraints in public.users

-- 1. Ensure all required columns exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'avatar_url') then
    alter table public.users add column avatar_url text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'role') then
    alter table public.users add column role text not null default 'guest';
  else
    -- Ensure it has a default and is not null
    alter table public.users alter column role set default 'guest';
    update public.users set role = 'guest' where role is null;
    alter table public.users alter column role set not null;
  end if;
end $$;

-- 2. Drop the problematic default and unique constraint on email
alter table public.users alter column id drop default;
alter table public.users alter column email drop not null;
alter table public.users drop constraint if exists users_email_key;

-- 3. Ensure ID is the primary key and references auth.users
-- (Primary key check)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where table_name = 'users' and constraint_type = 'PRIMARY KEY'
  ) then
    alter table public.users add primary key (id);
  end if;
end $$;

-- 4. Re-create the trigger function with extreme robustness
create or replace function public.handle_new_user() 
returns trigger 
language plpgsql 
security definer set search_path = public
as $$
begin
  -- Use an UPSERT style block to handle any race conditions or existing data
  begin
    insert into public.users (id, email, role, full_name, avatar_url)
    values (
      new.id, 
      new.email, 
      coalesce(new.raw_user_meta_data->>'role', 'guest'), 
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name),
      avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
      updated_at = now();

    -- Also ensure a profile exists
    insert into public.user_profiles (user_id, avatar_url)
    values (new.id, new.raw_user_meta_data->>'avatar_url')
    on conflict (user_id) do nothing;
  exception when others then
    -- Fallback: just try to update if insert failed for any non-PK reason
    update public.users set
      email = new.email,
      updated_at = now()
    where id = new.id;
  end;
    
  return new;
end;
$$;

-- 5. Ensure the trigger is actually attached
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
