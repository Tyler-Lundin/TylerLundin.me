-- Storage RLS policies for user avatars in `public` bucket

-- Allow authenticated users to insert into their own avatars folder
drop policy if exists "Auth insert avatars" on storage.objects;
create policy "Auth insert avatars"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'public'
    and (
      name like ('avatars/' || auth.uid() || '/%')
    )
  );

-- Allow authenticated users to update files within their own avatars folder
drop policy if exists "Auth update avatars" on storage.objects;
create policy "Auth update avatars"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'public'
    and (
      name like ('avatars/' || auth.uid() || '/%')
    )
  )
  with check (
    bucket_id = 'public'
    and (
      name like ('avatars/' || auth.uid() || '/%')
    )
  );

-- Allow authenticated users to delete files within their own avatars folder
drop policy if exists "Auth delete avatars" on storage.objects;
create policy "Auth delete avatars"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'public'
    and (
      name like ('avatars/' || auth.uid() || '/%')
    )
  );
-- Allow anonymous uploads to avatars path (since app uses custom auth, not Supabase Auth)
drop policy if exists "Public avatars insert" on storage.objects;
create policy "Public avatars insert"
  on storage.objects
  for insert
  to anon
  with check (
    bucket_id = 'public'
    and (name like 'avatars/%')
  );

