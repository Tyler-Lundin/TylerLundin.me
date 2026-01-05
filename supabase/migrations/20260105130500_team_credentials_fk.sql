-- Ensure FK from team_credentials.user_id to users.id with cascade
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'team_credentials_user_id_fkey'
  ) then
    alter table if exists public.team_credentials
      add constraint team_credentials_user_id_fkey
      foreign key (user_id) references public.users(id) on delete cascade;
  end if;
end $$;

