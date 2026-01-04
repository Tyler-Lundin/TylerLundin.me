-- Drop legacy admin_passwords table (run after verifying migration)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'admin_passwords'
  ) then
    drop table public.admin_passwords cascade;
  end if;
end $$;

