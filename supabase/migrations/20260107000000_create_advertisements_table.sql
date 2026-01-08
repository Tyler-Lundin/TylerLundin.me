-- Create advertisements table
create table if not exists advertisements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  
  -- Visuals & Placement
  placement text not null default 'banner', -- 'top_banner', 'sidebar', 'toast', 'modal'
  priority int default 0,
  
  -- Action / Conversion
  cta_text text default 'Get Offer',
  cta_link text not null,
  promo_code text, -- e.g. "free_website"
  
  -- Status
  is_active boolean default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,

  -- Styling
  styles jsonb default '{}'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table advertisements enable row level security;

-- Policies
create policy "Public can view active ads" on advertisements
  for select using (is_active = true and (ends_at is null or ends_at > now()));

create policy "Admins can manage ads" on advertisements
  for all using (
    exists (
      select 1 from users 
      where id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Trigger for updated_at
create or replace function update_advertisements_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_advertisements_updated_at
  before update on advertisements
  for each row
  execute function update_advertisements_updated_at();
