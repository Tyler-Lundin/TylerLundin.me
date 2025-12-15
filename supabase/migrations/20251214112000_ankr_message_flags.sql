-- Add intent flags to messages for fast-pass routing
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ankr_messages' and column_name = 'flags'
  ) then
    alter table public.ankr_messages add column flags jsonb not null default '[]'::jsonb;
  end if;
end $$;

-- Index for flags contains queries
create index if not exists ankr_messages_flags_idx on public.ankr_messages using gin (flags);

