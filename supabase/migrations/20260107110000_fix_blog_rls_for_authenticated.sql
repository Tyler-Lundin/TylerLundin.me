-- Fix Blog RLS policies to allow authenticated users to read published content
-- Previously these were restricted to 'anon' only, which caused issues for logged-in admins/users.

-- 1. blog_posts
drop policy if exists "blog_posts_select_published" on public.blog_posts;
create policy "blog_posts_select_published" on public.blog_posts
  for select to anon, authenticated using (status = 'published');

-- 2. blog_tags
drop policy if exists "blog_tags_select_anon" on public.blog_tags;
create policy "blog_tags_select_public" on public.blog_tags 
  for select to anon, authenticated using (true);

-- 3. blog_post_tags
drop policy if exists "blog_post_tags_select_anon" on public.blog_post_tags;
create policy "blog_post_tags_select_public" on public.blog_post_tags 
  for select to anon, authenticated using (true);

-- 4. blog_comments
drop policy if exists "blog_comments_select_approved" on public.blog_comments;
create policy "blog_comments_select_approved" on public.blog_comments
  for select to anon, authenticated using (status = 'approved');

-- 5. blog_post_views
drop policy if exists "blog_post_views_select_anon" on public.blog_post_views;
create policy "blog_post_views_select_public" on public.blog_post_views
  for select to anon, authenticated using (true);

-- 6. Grants on the public view
grant select on public.blog_posts_public to authenticated;
