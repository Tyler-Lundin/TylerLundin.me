-- Blog system: posts, tags, comments, views, public view, RLS

-- Ensure UUID generation available
create extension if not exists pgcrypto;

-- ============================
-- Enums
-- ============================
create type public.blog_post_status as enum ('draft','published','archived');
create type public.blog_comment_status as enum ('pending','approved','spam','deleted');

-- ============================
-- blog_posts
-- ============================
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text null,
  content_md text null,
  content_json jsonb null,
  cover_image_url text null,
  author_id uuid null references public.users(id) on delete set null,
  status public.blog_post_status not null default 'draft',
  reading_time_minutes int null,
  meta jsonb null,
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index blog_posts_published_at_idx on public.blog_posts(published_at desc);
create index blog_posts_status_idx on public.blog_posts(status);

-- RLS
alter table public.blog_posts enable row level security;
-- Read published posts publicly
drop policy if exists "blog_posts_select_published" on public.blog_posts;
create policy "blog_posts_select_published" on public.blog_posts
  for select to anon using (status = 'published');
-- Service role manage all
drop policy if exists "blog_posts_service_role_all" on public.blog_posts;
create policy "blog_posts_service_role_all" on public.blog_posts
  for all to service_role using (true) with check (true);

-- Auto-update updated_at
drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ============================
-- blog_tags & join table
-- ============================
create table public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index blog_post_tags_post_idx on public.blog_post_tags(post_id);
create index blog_post_tags_tag_idx on public.blog_post_tags(tag_id);

-- RLS (public read; service role manage)
alter table public.blog_tags enable row level security;
drop policy if exists "blog_tags_select_anon" on public.blog_tags;
create policy "blog_tags_select_anon" on public.blog_tags for select to anon using (true);
drop policy if exists "blog_tags_service_role_all" on public.blog_tags;
create policy "blog_tags_service_role_all" on public.blog_tags for all to service_role using (true) with check (true);

alter table public.blog_post_tags enable row level security;
drop policy if exists "blog_post_tags_select_anon" on public.blog_post_tags;
create policy "blog_post_tags_select_anon" on public.blog_post_tags for select to anon using (true);
drop policy if exists "blog_post_tags_service_role_all" on public.blog_post_tags;
create policy "blog_post_tags_service_role_all" on public.blog_post_tags for all to service_role using (true) with check (true);

-- ============================
-- blog_comments
-- ============================
create table public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  parent_id uuid null references public.blog_comments(id) on delete cascade,
  author_name text null,
  author_email text null,
  website_url text null,
  content text not null,
  status public.blog_comment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_comments_post_idx on public.blog_comments(post_id);
create index blog_comments_parent_idx on public.blog_comments(parent_id);
create index blog_comments_status_idx on public.blog_comments(status);

alter table public.blog_comments enable row level security;
-- Public can read approved comments only
drop policy if exists "blog_comments_select_approved" on public.blog_comments;
create policy "blog_comments_select_approved" on public.blog_comments
  for select to anon using (status = 'approved');
-- Public can submit comments (moderated)
drop policy if exists "blog_comments_insert_anon" on public.blog_comments;
create policy "blog_comments_insert_anon" on public.blog_comments
  for insert to anon with check (true);
-- Service role manages all
drop policy if exists "blog_comments_service_role_all" on public.blog_comments;
create policy "blog_comments_service_role_all" on public.blog_comments
  for all to service_role using (true) with check (true);

drop trigger if exists blog_comments_set_updated_at on public.blog_comments;
create trigger blog_comments_set_updated_at
  before update on public.blog_comments
  for each row execute function public.set_updated_at();

-- ============================
-- blog_post_views (simple view counter rows)
-- ============================
create table public.blog_post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  viewer_hash text null,
  viewed_at timestamptz not null default now()
);

create index blog_post_views_post_idx on public.blog_post_views(post_id);
create index blog_post_views_viewed_at_idx on public.blog_post_views(viewed_at desc);

alter table public.blog_post_views enable row level security;
-- Allow public inserts to count views
drop policy if exists "blog_post_views_insert_anon" on public.blog_post_views;
create policy "blog_post_views_insert_anon" on public.blog_post_views
  for insert to anon with check (true);
-- Allow public read (for simple counts); consider tightening later
drop policy if exists "blog_post_views_select_anon" on public.blog_post_views;
create policy "blog_post_views_select_anon" on public.blog_post_views
  for select to anon using (true);
-- Service role manage
drop policy if exists "blog_post_views_service_role_all" on public.blog_post_views;
create policy "blog_post_views_service_role_all" on public.blog_post_views
  for all to service_role using (true) with check (true);

-- ============================
-- Public aggregation view for published posts
-- ============================
create view public.blog_posts_public as
  select
    p.id,
    p.slug,
    p.title,
    p.excerpt,
    p.cover_image_url,
    p.author_id,
    p.published_at,
    p.created_at,
    p.updated_at,
    coalesce(vc.views_count, 0)::bigint as views_count,
    coalesce(cc.comments_count, 0)::bigint as comments_count,
    coalesce(tl.tags, '{}') as tags
  from public.blog_posts p
  left join (
    select post_id, count(*)::bigint as views_count
    from public.blog_post_views
    group by post_id
  ) vc on vc.post_id = p.id
  left join (
    select post_id, count(*)::bigint as comments_count
    from public.blog_comments
    where status = 'approved'
    group by post_id
  ) cc on cc.post_id = p.id
  left join (
    select pt.post_id, array_agg(distinct t.name order by t.name) as tags
    from public.blog_post_tags pt
    join public.blog_tags t on t.id = pt.tag_id
    group by pt.post_id
  ) tl on tl.post_id = p.id
  where p.status = 'published';

-- Grant basic privileges to anon on the view
grant select on public.blog_posts_public to anon;

