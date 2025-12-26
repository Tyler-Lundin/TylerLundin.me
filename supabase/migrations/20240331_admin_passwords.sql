-- Ensure table exists with canonical schema (UUID PK) if missing
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'admin_passwords'
  ) then
    create table public.admin_passwords (
      id uuid primary key default gen_random_uuid(),
      password_1_hash text not null,
      password_2_hash text not null,
      password_3_hash text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  end if;
end $$;

-- Enable Row Level Security
alter table public.admin_passwords enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow service role to access admin_passwords" on public.admin_passwords;
drop policy if exists "Allow authenticated users to read admin_passwords" on public.admin_passwords;

-- Create a more permissive policy for service role
create policy "Service role full access"
  on public.admin_passwords
  for all
  to service_role
  using (true)
  with check (true);

-- Create a read-only policy for authenticated users
create policy "Authenticated users read access"
  on public.admin_passwords
  for select
  to authenticated
  using (true);

-- Grant necessary permissions
grant usage on schema public to service_role;
grant all on public.admin_passwords to service_role;
grant all on public.admin_passwords to authenticated;

-- Seed a row if table is empty (avoid specifying id to support UUID PK)
insert into public.admin_passwords (password_1_hash, password_2_hash, password_3_hash)
select 
  '$2b$10$FCnVI36oL.GrPIZBRcUYAutznAnmI/pcRO1.VotTH3shqAGEJt21G',
  '$2b$10$xwNynqhpaQoirwwErQkGS.ufc7pnRdw0Q65AdMGdPshiKVLyFToKe',
  '$2b$10$2uhhnfoR1CC0wpQQengqeuCEc2PSlg9gyuVGMfz65NWJ/8z8r28Ee'
where not exists (select 1 from public.admin_passwords);
