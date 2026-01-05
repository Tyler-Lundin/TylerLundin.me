-- Ensure a foreign key from user_profiles.user_id to users.id so PostgREST can embed
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_profiles_user_id_fkey'
  ) then
    alter table if exists public.user_profiles
      add constraint user_profiles_user_id_fkey
      foreign key (user_id) references public.users(id) on delete cascade;
  end if;
end $$;

