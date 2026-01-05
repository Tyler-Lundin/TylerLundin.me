-- Add visibility to user_profiles (public or private)
alter table if exists public.user_profiles
  add column if not exists visibility text not null default 'public';

-- Constrain values
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_profiles_visibility_chk'
  ) then
    alter table public.user_profiles
      add constraint user_profiles_visibility_chk
      check (visibility in ('public','private'));
  end if;
end $$;

-- Public read policy for visible profiles
alter table if exists public.user_profiles enable row level security;
drop policy if exists "user_profiles_public_read" on public.user_profiles;
create policy "user_profiles_public_read"
on public.user_profiles
for select
to anon, authenticated
using (visibility = 'public');

-- Add author_id to blog_posts referencing public.users
alter table if exists public.blog_posts
  add column if not exists author_id uuid references public.users(id) on delete set null;

create index if not exists blog_posts_author_idx on public.blog_posts(author_id);

