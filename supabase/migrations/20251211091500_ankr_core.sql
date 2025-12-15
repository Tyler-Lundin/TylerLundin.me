-- Ankr core schema: topics, snippets, threads, messages, citations, embeddings, thread state
-- Safe to run multiple times in local dev (if not exists guards where possible)

-- Extensions
create extension if not exists pgcrypto; -- gen_random_uuid, digest
create extension if not exists pg_trgm;  -- optional fuzzy search
create extension if not exists vector;   -- embeddings (optional)

-- ============================
-- ankr_topics
-- ============================
create table if not exists public.ankr_topics (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('project','feature','seo','content','note','other')),
  slug text not null unique,
  title text not null,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ankr_topics enable row level security;

-- service role full access
drop policy if exists "ankr_topics_service_full" on public.ankr_topics;
create policy "ankr_topics_service_full"
  on public.ankr_topics
  for all
  to service_role
  using (true)
  with check (true);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ankr_topics_set_updated_at on public.ankr_topics;
create trigger ankr_topics_set_updated_at
  before update on public.ankr_topics
  for each row execute function public.set_updated_at();

-- ============================
-- ankr_snippets
-- ============================
create table if not exists public.ankr_snippets (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.ankr_topics(id) on delete cascade,
  source_kind text not null check (source_kind in ('file','url','note','other')),
  source_ref text null,
  content text not null,
  meta jsonb not null default '{}'::jsonb,     -- provenance (anchor, url, etc.)
  facets jsonb not null default '{}'::jsonb,   -- tags (status, priority, area)
  private boolean not null default true,
  weight int not null default 0,
  hash text null,
  supersedes_id uuid null references public.ankr_snippets(id) on delete set null,
  expires_at timestamptz null,
  created_at timestamptz not null default now()
);

alter table public.ankr_snippets enable row level security;

drop policy if exists "ankr_snippets_service_full" on public.ankr_snippets;
create policy "ankr_snippets_service_full"
  on public.ankr_snippets
  for all
  to service_role
  using (true)
  with check (true);

-- compute hash if not provided (content + '|' + source_ref)
create or replace function public.ankr_snippets_set_hash()
returns trigger as $$
begin
  if new.hash is null then
    new.hash := encode(digest(coalesce(new.content,'') || '|' || coalesce(new.source_ref,''), 'sha256'), 'hex');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists ankr_snippets_hash on public.ankr_snippets;
create trigger ankr_snippets_hash
  before insert on public.ankr_snippets
  for each row execute function public.ankr_snippets_set_hash();

-- Indexes
create index if not exists ankr_snippets_topic_idx on public.ankr_snippets (topic_id, weight desc, created_at desc);
create index if not exists ankr_snippets_created_idx on public.ankr_snippets (created_at desc);
create index if not exists ankr_snippets_expires_idx on public.ankr_snippets (expires_at);
create index if not exists ankr_snippets_meta_idx on public.ankr_snippets using gin (meta);
create index if not exists ankr_snippets_facets_idx on public.ankr_snippets using gin (facets);
create index if not exists ankr_snippets_content_fts on public.ankr_snippets using gin (to_tsvector('english', coalesce(content,'')));
create unique index if not exists ankr_snippets_hash_unique on public.ankr_snippets (hash) where hash is not null;

-- ============================
-- ankr_threads
-- ============================
create table if not exists public.ankr_threads (
  id uuid primary key default gen_random_uuid(),
  title text null,
  created_by text null,
  created_at timestamptz not null default now()
);

alter table public.ankr_threads enable row level security;

drop policy if exists "ankr_threads_service_full" on public.ankr_threads;
create policy "ankr_threads_service_full"
  on public.ankr_threads
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists ankr_threads_created_idx on public.ankr_threads (created_at desc);

-- ============================
-- ankr_thread_topics (attach topics to thread)
-- ============================
create table if not exists public.ankr_thread_topics (
  thread_id uuid not null references public.ankr_threads(id) on delete cascade,
  topic_id uuid not null references public.ankr_topics(id) on delete cascade,
  pinned boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (thread_id, topic_id)
);

alter table public.ankr_thread_topics enable row level security;

drop policy if exists "ankr_thread_topics_service_full" on public.ankr_thread_topics;
create policy "ankr_thread_topics_service_full"
  on public.ankr_thread_topics
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists ankr_thread_topics_thread_idx on public.ankr_thread_topics (thread_id);

-- ============================
-- ankr_messages
-- ============================
create table if not exists public.ankr_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ankr_threads(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  model text null,
  created_at timestamptz not null default now()
);

alter table public.ankr_messages enable row level security;

drop policy if exists "ankr_messages_service_full" on public.ankr_messages;
create policy "ankr_messages_service_full"
  on public.ankr_messages
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists ankr_messages_thread_idx on public.ankr_messages (thread_id, created_at asc);
create index if not exists ankr_messages_created_idx on public.ankr_messages (created_at desc);

-- ============================
-- ankr_message_citations (message -> snippets)
-- ============================
create table if not exists public.ankr_message_citations (
  message_id uuid not null references public.ankr_messages(id) on delete cascade,
  snippet_id uuid not null references public.ankr_snippets(id) on delete cascade,
  rank int not null default 0,
  primary key (message_id, snippet_id)
);

alter table public.ankr_message_citations enable row level security;

drop policy if exists "ankr_message_citations_service_full" on public.ankr_message_citations;
create policy "ankr_message_citations_service_full"
  on public.ankr_message_citations
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists ankr_message_citations_msg_rank_idx on public.ankr_message_citations (message_id, rank);

-- ============================
-- ankr_embeddings (optional embeddings store)
-- ============================
create table if not exists public.ankr_embeddings (
  snippet_id uuid primary key references public.ankr_snippets(id) on delete cascade,
  embedding vector(1536), -- adjust dim per model
  dim int not null default 1536,
  updated_at timestamptz not null default now()
);

alter table public.ankr_embeddings enable row level security;

drop policy if exists "ankr_embeddings_service_full" on public.ankr_embeddings;
create policy "ankr_embeddings_service_full"
  on public.ankr_embeddings
  for all
  to service_role
  using (true)
  with check (true);

-- vector index (requires extension); ivfflat performs well for kNN
do $$
begin
  perform 1 from pg_extension where extname = 'vector';
  if found then
    execute 'create index if not exists ankr_embeddings_embedding_idx on public.ankr_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100)';
  end if;
end $$;

-- ============================
-- ankr_thread_state (rolling summary)
-- ============================
create table if not exists public.ankr_thread_state (
  thread_id uuid primary key references public.ankr_threads(id) on delete cascade,
  summary text null,
  last_msg_id uuid null references public.ankr_messages(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.ankr_thread_state enable row level security;

drop policy if exists "ankr_thread_state_service_full" on public.ankr_thread_state;
create policy "ankr_thread_state_service_full"
  on public.ankr_thread_state
  for all
  to service_role
  using (true)
  with check (true);

drop trigger if exists ankr_thread_state_set_updated_at on public.ankr_thread_state;
create trigger ankr_thread_state_set_updated_at
  before update on public.ankr_thread_state
  for each row execute function public.set_updated_at();

-- Grants (ensure service role can use schema and tables)
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

