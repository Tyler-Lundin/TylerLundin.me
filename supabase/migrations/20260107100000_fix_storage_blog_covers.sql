-- Fix Storage RLS for blog-covers and public bucket to allow authenticated users (Admins/Marketing)

-- 1. Ensure public bucket read access for everyone (anon and authenticated)
drop policy if exists "Public bucket read" on storage.objects;
create policy "Public bucket read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'public');

-- 2. Allow authenticated users to insert into blog-covers
drop policy if exists "Auth insert blog-covers" on storage.objects;
create policy "Auth insert blog-covers"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'public'
    and (name like 'blog-covers/%')
  );

-- 3. Allow authenticated users to update/delete in blog-covers (maintenance)
drop policy if exists "Auth update blog-covers" on storage.objects;
create policy "Auth update blog-covers"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'public'
    and (name like 'blog-covers/%')
  )
  with check (
    bucket_id = 'public'
    and (name like 'blog-covers/%')
  );

drop policy if exists "Auth delete blog-covers" on storage.objects;
create policy "Auth delete blog-covers"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'public'
    and (name like 'blog-covers/%')
  );

-- 4. Keep the anon policy for now if needed (though authenticated is safer)
drop policy if exists "Public blog-covers insert" on storage.objects;
create policy "Public blog-covers insert"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'public' and (name like 'blog-covers/%'));