-- Outreach templates for ContactLead wizard
create extension if not exists "pgcrypto";

drop table if exists public.outreach_templates cascade;

create table public.outreach_templates (
  id uuid primary key default gen_random_uuid(),
  key text unique,
  name text not null,
  channel text not null check (channel in ('email','sms')),
  subject text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_outreach_templates_channel on public.outreach_templates(channel);

-- RLS: admin and service_role
alter table if exists public.outreach_templates enable row level security;
drop policy if exists "outreach_templates_admin_all" on public.outreach_templates;
create policy "outreach_templates_admin_all" on public.outreach_templates
  for all to authenticated
  using (public.crm_is_admin())
  with check (public.crm_is_admin());

drop policy if exists "outreach_templates_service_role_all" on public.outreach_templates;
create policy "outreach_templates_service_role_all" on public.outreach_templates
  for all to service_role
  using (true)
  with check (true);

-- Seed templates
insert into public.outreach_templates (key, name, channel, subject, body) values
  ('no-website-email', 'No Website Outreach (Email)', 'email', 'Quick website help for {name}',
   'Hi {name},\n\nI was looking for your business online and noticed there isn''t a website listed. A simple site can help people find and contact you (even a basic one-page with phone, hours, and location).\n\nIf you''re open to it, I can spin up a quick example for {name} and share options. No obligation.\n\nBest,\nTyler'),
  ('broken-website-email', 'Broken Website (Email)', 'email', 'Noticed an issue on {domain}',
   'Hi {name},\n\nI visited {domain} and noticed some issues (e.g., SSL warnings, broken links, or slow loading). If you''d like, I can share a quick report and a simple fix plan.\n\nWould you be open to a quick chat?\n\nBest,\nTyler'),
  ('general-intro-email', 'General Intro (Email)', 'email', 'Quick question for {name}',
   'Hi {name},\n\nI came across {domain} and wanted to reach out. If you ever want help with updates, speed, or a refresh, I''m happy to share ideas.\n\nBest,\nTyler'),
  ('no-website-sms', 'No Website (SMS)', 'sms', null,
   'Hi {name} — I couldn’t find a website for your business. If you want, I can make a quick example and share options. - Tyler')
on conflict (key) do nothing;

