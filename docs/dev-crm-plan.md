
# Dev CRM Plan (/dev/crm) — Revised MVP

This document captures the initial design and scope for building a CRM dashboard under `/dev/crm`, plus a minimal client portal. It aligns with Next.js + Supabase, prioritizes RLS-first security, and keeps the MVP small enough to finish.

## Goals

* Centralize client + project management in `/dev/crm` (admin-only).
* Model **one client organization/person owning many projects**.
* Track projects with attached services, links/artifacts, lists (goals/bugs/tasks), and notes.
* Keep client access lightweight: profile + project visibility.
* Use invite-only, passwordless auth (no stored passwords).

---

## Core Entities

* **Clients**: Organizations or individuals you work with.
* **Client Contacts (optional, MVP-lite)**: Non-auth “people records” (name/email/phone) for the client org.
* **Projects**: Units of work (e.g., “Acme Website Redesign”), owned by exactly one client.
* **Services**: Catalog offerings attached to projects (many-to-many).
* **Users/Profiles**: Authenticated identities. Admin(s) have full access; client users have limited access.
* **Client Memberships**: Users belong to one or more clients (not “profiles.client_id”).
* **Notes**: Internal notes; can optionally be marked client-visible.
* **Lists**: Goals/bugs/tasks/custom lists per project.
* **Links/Artifacts**: Repos, live/staging URLs, docs, etc.

---

## Relationships (simplified, MVP-safe)

* **Client → Projects**: **One-to-many** (`projects.client_id`)
* **Client ↔ Users**: **Many-to-many** (`client_users`)
* **Project ↔ Services**: Many-to-many (`project_services`)
* **Project → Links / Lists / Notes**: One-to-many
* **List → Items**: One-to-many

---

## Data Model (proposed)

### clients

* `id (uuid pk)`
* `name (text)`
* `company (text nullable)`
* `website_url (text nullable)`
* `phone (text nullable)`
* `billing_notes (text nullable)`
* `created_at (timestamptz default now())`

### client_contacts (optional, MVP-lite)

* `id (uuid pk)`
* `client_id (uuid fk -> clients.id)`
* `name (text)`
* `email (text nullable)`
* `phone (text nullable)`
* `title (text nullable)`
* `created_at`

### projects

* `id (uuid pk)`
* `client_id (uuid fk -> clients.id)` **(one client per project)**
* `slug (text unique)`
* `title (text)`
* `description (text nullable)`
* `status (planned|in_progress|paused|completed|archived)`
* `priority (low|normal|high|urgent)`
* `started_at (date nullable)`
* `due_at (date nullable)`
* `ended_at (date nullable)`
* `created_at`

### services (catalog)

* `id (uuid pk)`
* `key (text unique)` (e.g., website, logo, brand, seo)
* `name (text)`
* `description (text nullable)`
* `is_active (bool default true)`
* `created_at`

### project_services (join)

* `project_id (uuid fk -> projects.id)`
* `service_id (uuid fk -> services.id)`
* `created_at`
* **PK**: (`project_id`, `service_id`)

### project_links (artifacts/urls)

* `id (uuid pk)`
* `project_id (uuid fk -> projects.id)`
* `type (live|staging|repo|docs|design|tracker|other)`
* `url (text)`
* `label (text nullable)`
* `meta (jsonb nullable)`
* `is_client_visible (bool default true)`
* `created_at`

### project_lists (collections)

* `id (uuid pk)`
* `project_id (uuid fk -> projects.id)`
* `key (goals|bugs|tasks|custom)`
* `title (text)`
* `created_at`

### project_list_items

* `id (uuid pk)`
* `list_id (uuid fk -> project_lists.id)`
* `title (text)`
* `description (text nullable)`
* `status (open|in_progress|done)`
* `priority (low|normal|high|urgent)`
* `assignee_user_id (uuid nullable fk -> profiles.user_id)` **(not free text)**
* `due_at (date nullable)`
* `sort (int nullable)`
* `is_client_visible (bool default false)` **(important)**
* `created_at`

### project_notes

* `id (uuid pk)`
* `project_id (uuid fk -> projects.id)`
* `author_id (uuid fk -> profiles.user_id)`
* `body (text)` (markdown)
* `is_private (bool default true)` **(private by default)**
* `created_at`

### client_notes

* `id (uuid pk)`
* `client_id (uuid fk -> clients.id)`
* `author_id (uuid fk -> profiles.user_id)`
* `body (text)` (markdown)
* `is_private (bool default true)`
* `created_at`

### profiles

* `user_id (uuid pk = auth.uid())`
* `email (text)`
* `name (text nullable)`
* `role (admin|client)` **(global role)**
* `created_at`

### client_users (membership; replaces profiles.client_id)

* `client_id (uuid fk -> clients.id)`
* `user_id (uuid fk -> profiles.user_id)`
* `role (owner|stakeholder|viewer)`
* `created_at`
* **PK**: (`client_id`, `user_id`)

### invitations

* `id (uuid pk)`
* `email (text)`
* `token_hash (text)` **(hashed)**
* `role (client|admin)`
* `client_id (uuid nullable)` (for client invites)
* `expires_at (timestamptz)`
* `accepted_at (timestamptz nullable)`
* `created_at`

### public_links (minimal client-facing access, optional)

If you want shareable pages (quote/onboarding later), keep this generic:

* `id (uuid pk)`
* `token (text unique)` (store hashed if you want stronger posture)
* `type (quote|onboarding|project_view|other)`
* `resource_id (uuid)`
* `expires_at`
* `created_at`

### storage (Supabase buckets)

* Attachments for notes/list items later (not MVP).

---

## Auth (Invite-only, Passwordless)

### Flow (MVP-safe)

* Admin creates an **invitation** (email + role + optional client_id + expiry).
* Recipient opens invite link → your endpoint validates token + marks invitation consumed.
* Recipient signs in via Supabase passwordless email OTP/magic link.
* On first authenticated session:

  * ensure `profiles` exists for `auth.uid()`
  * create `client_users` membership if invitation includes `client_id`
  * set `profiles.role` based on invitation (admin/client)

**No stored passwords.** Repeat sign-ins use email OTP/magic link.

---

## Routing & Access Control

### Admin (protected)

* `/dev/crm` — dashboard: active projects, recent updates
* `/dev/crm/clients` — list + detail (projects, contacts, notes)
* `/dev/crm/projects` — list + detail (services, links, lists, notes)
* `/dev/crm/invitations` — issue/revoke invites, track acceptance

### Client Portal (minimal)

* `/portal` — profile + list of projects for any clients they belong to
* `/portal/projects/[slug]` — project summary (status, client-visible links)

  * optionally show only list items where `is_client_visible = true`
  * never show private notes

---

## Admin Features (MVP)

* Clients: create/edit; internal notes.
* Projects: create/edit; status/priority; services; links.
* Lists: goals/bugs/tasks; statuses; priorities; due dates.
* Notes: internal by default; option to mark client-visible (or use `is_private=false`).
* Invitations: create, revoke, track acceptance.

---

## Nice-to-haves (defer)

* Activity log/audit table.
* Attachments via Supabase Storage.
* GitHub/Jira integrations; link-outs only for now.
* Per-project custom fields/tags (jsonb).

---

## Security & Privacy

### Row Level Security (RLS)

* **Admin**: full read/write.
* **Client users**:

  * can read `projects` where `projects.client_id` is in their `client_users` memberships
  * can read `project_links` where `is_client_visible = true` (and project is authorized)
  * can read `project_list_items` where `is_client_visible = true` (and project is authorized)
  * cannot read private notes (`is_private = true`)
* Invitations:

  * tokens are hashed; short expiry; single-use.

**Default posture:** private unless explicitly client-visible.

---

## Email

* Invitation email template (includes invite link).
* Expiration messaging + re-invite flow.
* Optional resend.

---

## Defaults for “Open Questions”

* Clients see **project summary + client-visible links**.
* Clients optionally see **Goals** list items only where `is_client_visible=true`.
* Multiple contacts per client supported via `client_contacts`.
* Time tracking/billing hooks deferred.

---

## Milestones

* **M0:** SQL migrations draft + RLS policy plan.
* **M1:** Admin skeleton UI under `/dev/crm` (clients/projects list/detail).
* **M2:** Invite gating + client portal skeleton.
* **M3:** Lists (goals/bugs/tasks) with basic filtering.
* **M4:** Polish (attachments/activity log/bulk actions).

---

## Next Steps

1. Confirm naming: keep **services** as the catalog term.
2. Confirm portal route: `/portal` (recommended) vs `/app`.
3. Draft SQL migrations + RLS for the revised schema.
4. Scaffold `/dev/crm` routes and minimal admin pages (list/detail).
5. Implement invite gating + email templates.

