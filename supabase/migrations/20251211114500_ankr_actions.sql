-- Ankr action calls table: logs AI-requested actions with lifecycle status

create table if not exists public.ankr_action_calls (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid null references public.ankr_threads(id) on delete set null,
  source_message_id uuid null references public.ankr_messages(id) on delete set null,
  requested_by text not null default 'assistant' check (requested_by in ('assistant','user','system')),
  action_name text not null,
  params jsonb not null default '{}'::jsonb,
  status text not null default 'requested' check (status in ('requested','acknowledged','running','succeeded','failed','cancelled')),
  status_info jsonb null,
  correlation_id text null,
  acknowledged_by text null,
  executed_by text null,
  executed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ankr_action_calls enable row level security;

drop policy if exists "ankr_action_calls_service_full" on public.ankr_action_calls;
create policy "ankr_action_calls_service_full"
  on public.ankr_action_calls
  for all
  to service_role
  using (true)
  with check (true);

-- indexes for lifecycle processing
create index if not exists ankr_action_calls_thread_idx on public.ankr_action_calls (thread_id);
create index if not exists ankr_action_calls_status_idx on public.ankr_action_calls (status, created_at desc);
create index if not exists ankr_action_calls_message_idx on public.ankr_action_calls (source_message_id);
create index if not exists ankr_action_calls_action_idx on public.ankr_action_calls (action_name);

-- trigger to auto-update updated_at
drop trigger if exists ankr_action_calls_set_updated_at on public.ankr_action_calls;
create trigger ankr_action_calls_set_updated_at
  before update on public.ankr_action_calls
  for each row execute function public.set_updated_at();

