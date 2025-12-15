-- Add tags array to ankr_topics for keyword-based matching
-- Safe re-run with IF NOT EXISTS guards

alter table public.ankr_topics
  add column if not exists tags text[] not null default '{}'::text[];

-- GIN index for fast array contains queries (@>)
create index if not exists ankr_topics_tags_gin on public.ankr_topics using gin (tags);

-- Simple backfill: derive tags from title tokens (>=3 chars)
update public.ankr_topics t
set tags = (
  select coalesce(array_agg(distinct tok), '{}'::text[])
  from (
    select x as tok
    from unnest(regexp_split_to_array(lower(coalesce(t.title,'')), '[^a-z0-9]+')) as x
    where length(x) >= 3
  ) s
)
where coalesce(t.tags, '{}'::text[]) = '{}'::text[];
