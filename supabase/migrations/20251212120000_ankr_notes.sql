-- Ankr notes: first-class short, typed notes (goal/thought/decision/question/todo)

create table if not exists public.ankr_notes (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid null references public.ankr_threads(id) on delete set null,
  topic_id uuid null references public.ankr_topics(id) on delete set null,
  type text not null check (type in ('goal','thought','decision','question','todo')),
  content text not null,
  source_ref text null,
  meta jsonb not null default '{}'::jsonb,
  weight int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ankr_notes enable row level security;

-- service role full access
drop policy if exists "ankr_notes_service_full" on public.ankr_notes;
create policy "ankr_notes_service_full"
  on public.ankr_notes
  for all
  to service_role
  using (true)
  with check (true);

-- auto-update updated_at
drop trigger if exists ankr_notes_set_updated_at on public.ankr_notes;
create trigger ankr_notes_set_updated_at
  before update on public.ankr_notes
  for each row execute function public.set_updated_at();

-- indexes
create index if not exists ankr_notes_thread_idx on public.ankr_notes (thread_id, created_at desc);
create index if not exists ankr_notes_topic_idx on public.ankr_notes (topic_id, weight desc, created_at desc);
create index if not exists ankr_notes_created_idx on public.ankr_notes (created_at desc);

