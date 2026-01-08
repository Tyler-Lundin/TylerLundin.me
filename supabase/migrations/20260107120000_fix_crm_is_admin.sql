-- Update crm_is_admin to use the new consolidated users table
-- This repairs many RLS policies that were broken by the removal of crm_profiles

create or replace function public.crm_is_admin()
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

-- Ensure permissions are still correct
revoke all on function public.crm_is_admin() from public;
grant execute on function public.crm_is_admin() to authenticated;
