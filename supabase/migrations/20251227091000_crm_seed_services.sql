-- Seed initial CRM services catalog
-- Safe upserts keyed by `key` to avoid duplicates across environments

insert into public.crm_services (key, name, description)
values
  ('website',   'Website',   'Design, build, and maintain marketing or product websites'),
  ('ecommerce', 'E‑commerce','Online store setup, payments, checkout, and catalog'),
  ('branding',  'Branding',  'Identity, logo, and visual system foundations'),
  ('seo',       'SEO',       'Search optimization, technical audits, and content strategy'),
  ('cms',       'CMS',       'Content modeling, authoring workflows, and publishing'),
  ('analytics', 'Analytics', 'Tracking, dashboards, and conversion insights'),
  ('hosting',   'Hosting',   'Infra, deployment pipelines, and environments'),
  ('support',   'Support',   'Ongoing maintenance, updates, and incident response'),
  ('devops',    'DevOps',    'CI/CD, observability, and automation')
on conflict (key) do update
set name = excluded.name,
    description = excluded.description,
    is_active = true;

