-- Fix recursion in public.users policy by using a SECURITY DEFINER function
-- Also ensure is_admin exists

-- 1. Create/Replace is_admin function (Security Definer to bypass RLS)
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

-- 2. Drop the recursive policy
drop policy if exists "Admins can manage all profiles" on public.users;

-- 3. Re-create the policy using the function
create policy "Admins can manage all profiles" 
  on public.users for all 
  using ( public.is_admin() );


-- 4. Ensure email column is nullable in public.users to avoid 'null value' errors during upserts 
-- if email isn't provided (though it should be).
-- Or, if the error was due to 'users' table existing from an old migration with NOT NULL.
alter table public.users alter column email drop not null;

-- 5. Fix crm_profiles dependency if it's still stuck (ensure we drop the constraint causing issues)
-- Attempt to drop the constraint from crm_ai_tasks if it exists
do $$
begin
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'crm_ai_tasks_created_by_fkey') then
    alter table public.crm_ai_tasks drop constraint crm_ai_tasks_created_by_fkey;
  end if;
end $$;

-- Drop crm_profiles if it still exists
drop table if exists public.crm_profiles cascade;

-- Ensure crm_ai_tasks points to users
do $$
begin
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'crm_ai_tasks_created_by_fkey') then
    alter table public.crm_ai_tasks
      add constraint crm_ai_tasks_created_by_fkey
      foreign key (created_by) references public.users(id) on delete cascade;
  end if;
end $$;
