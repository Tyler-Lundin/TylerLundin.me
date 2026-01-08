-- Fix missing profiles for existing users
insert into public.user_profiles (user_id, avatar_url)
select id, avatar_url from public.users
on conflict (user_id) do nothing;
