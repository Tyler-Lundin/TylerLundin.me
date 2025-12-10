-- Storage setup: public bucket for site assets and blog covers

-- Create bucket `public` if missing
insert into storage.buckets (id, name, public)
values ('public', 'public', true)
on conflict (id) do nothing;

-- RLS policies on storage.objects
-- Public read access for the `public` bucket
drop policy if exists "Public bucket read" on storage.objects;
create policy "Public bucket read"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'public');

-- Allow anon uploads to blog-covers path (wizard), restrict to `public` bucket only
drop policy if exists "Public blog-covers insert" on storage.objects;
create policy "Public blog-covers insert"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'public' and (name like 'blog-covers/%'));

-- Service role full control for maintenance
drop policy if exists "Service role manage public bucket" on storage.objects;
create policy "Service role manage public bucket"
  on storage.objects
  for all
  to service_role
  using (bucket_id = 'public')
  with check (bucket_id = 'public');

