-- Anti-spam additions for blog comments

alter table public.blog_comments
  add column if not exists viewer_hash text null,
  add column if not exists user_agent text null;

create index if not exists blog_comments_viewer_hash_idx on public.blog_comments(viewer_hash);
create index if not exists blog_comments_created_at_idx on public.blog_comments(created_at desc);

