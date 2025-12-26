# Dev CRM Plan (/dev/crm)

This document captures the initial design and scope for building a CRM dashboard under `/dev/crm`, plus the minimal client-facing experience. It aligns with the existing stack (Next.js + Supabase) and can evolve into migrations and UI work.

## Goals
- Centralize client + project management in `/dev/crm`.
- Track projects with attached services/products, repos, environments, lists (goals/bugs/tasks), and notes.
- Keep client access lightweight: profile + project visibility only.
- Use invite-only, passwordless auth (no stored passwords).

## Core Entities
- Clients: Organizations or individuals you work with.
- Projects: Units of work (e.g., “Acme Website Redesign”).
- Services: The offerings attached to a project (e.g., Website, Logo, Brand, SEO). A project can have many services; a service can belong to many projects.
- Users/Profiles: Authenticated identities. Admin (you) has full visibility via `/dev/crm`; clients have limited access.
- Notes: Internal/admin notes on clients and projects.
- Lists: Track goals, bugs, tasks, and custom lists per project.
- Links/Artifacts: Git repos, live/staging URLs, docs, etc.

## Relationships
- Clients ↔ Projects: Many-to-many (one or many clients can attach to one or many projects).
- Projects ↔ Services: Many-to-many.
- Users ↔ Clients: One user may belong to a client; admin user(s) stand alone.

## Data Model (proposed)
- clients
  - id (uuid), name, email, company, website_url, phone, billing_notes, created_at
- projects
  - id (uuid), slug, title, description, status (planned/in-progress/paused/completed/archived), priority, started_at, due_at, ended_at, created_at
- project_clients (join)
  - project_id, client_id, role (owner/stakeholder/viewer), created_at
- services (catalog)
  - id, key (e.g., website, logo, brand, seo), name, description, is_active
- project_services (join)
  - project_id, service_id, created_at
- project_links (artifacts/urls)
  - id, project_id, type (live|staging|repo|docs|design|tracker|other), url, label, meta (jsonb), created_at
- project_lists (collections)
  - id, project_id, key (goals|bugs|tasks|custom), title, created_at
- project_list_items
  - id, list_id, title, description, status (open|in-progress|done), priority, assignee, due_at, sort, created_at
- project_notes
  - id, project_id, author_id, body (markdown), is_private (default true), created_at
- client_notes
  - id, client_id, author_id, body (markdown), is_private (default true), created_at
- invitations
  - id, email, token (hashed), role (client|admin), client_id (nullable), project_id (nullable), expires_at, accepted_at, created_at
- profiles
  - user_id (auth.uid), email, name, client_id (nullable), role (admin|client), created_at
- activity_log (optional, for audit)
  - id, actor_id, scope (client|project|system), scope_id, action, meta (jsonb), created_at
- storage (Supabase buckets): attachments for notes/list items if needed later

Notes
- “Services” is the unifying term instead of “types/products”; if a separate “products” catalog is needed later, we can mirror the pattern.
- Repos and website URLs live in `project_links` with typed entries; this keeps it extensible.

## Auth (Invite-only, Passwordless)
- Flow
  - Admin captures an email and issues an invitation (creates `invitations` row with token + expiry; sends magic-link email).
  - Recipient clicks link → exchange token for a one-time session → creates/links `profiles` row.
  - No password stored. Repeat sign-ins refresh via email magic link.
- Access
  - Admin role: full `/dev/crm` access.
  - Client role: limited portal (profile + authorized projects, read-only or narrow write as configured).

## Routing & Access Control
- Admin
  - `/dev/crm` → dashboard overview: active projects, tasks/bugs, recent notes.
  - `/dev/crm/clients` → list + detail; add notes; related projects.
  - `/dev/crm/projects` → list + detail; services, links, lists, notes.
  - `/dev/crm/invitations` → issue/revoke invites, resend magic links.
- Client (minimal)
  - `/portal` (or `/app`) → profile (email), list of associated projects.
  - Project view: title, description, status, visible links (e.g., live site), and optionally read-only goals.

## Admin Features (MVP)
- Client management: create/edit clients, admin-only notes.
- Project management: details, status, services, links (repo/website/docs), timeline.
- Lists: goals/bugs/tasks with statuses and priorities.
- Notes: internal notes on projects and clients.
- Invitations: create, send, revoke, track acceptance.

## Nice-to-haves
- Activity log per project.
- Attachments on notes and list items (via Supabase Storage).
- Issue syncing or link-outs (GitHub/Jira) via `project_links`.
- Per-project custom fields (jsonb) and tags.

## Security & Privacy
- Row Level Security (RLS)
  - Admin role: full read/write.
  - Client role: restrict to rows where `client_id` matches or via `project_clients` membership.
  - Notes default to `is_private = true`; client cannot read private notes.
- Tokens hashed in `invitations`. Short expiry. Single-use.

## Email
- Templates for invitation and magic link.
- Resend flow and expiration handling.

## Open Questions
- Should clients see limited lists (e.g., goals) or only project summaries?
- Do we want per-project task assignment to specific client contacts?
- Single client contact vs multiple contacts per client?
- Do we want time tracking/billing hooks now or later?

## Milestones
- M0: Schema migration draft + RLS policy plan.
- M1: Admin skeleton UI under `/dev/crm` (lists, details, notes).
- M2: Invite flow + client portal skeleton.
- M3: Lists (goals/bugs/tasks) with basic filters and sorting.
- M4: Polish: activity log, attachments, bulk actions.

## Next Steps
1) Confirm the entity names (“services” good?) and the client portal route (`/portal` vs `/app`).
2) I’ll draft SQL migrations for tables + RLS aligned to Supabase.
3) Scaffold `/dev/crm` routes and minimal admin pages (list/detail).
4) Implement invite flow and email templates.
