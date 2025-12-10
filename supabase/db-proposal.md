# Database Initialization Proposal

This proposal captures what should live in the database based on current code usage and the `src/types` and `src/config` files. It focuses on enabling existing app flows first, with clear next-phase candidates for future iteration.

## Phase 1: Core Tables (used today)

- contact_submissions:
  - Purpose: Persist contact form submissions from the site and view them in dev/admin screens.
  - Columns: `id (uuid pk)`, `name`, `email`, `message`, `budget (nullable)`, `status (text, default 'new')`, `created_at (timestamptz)`.
  - RLS: Allow anon insert (public form). Allow select for anon for now to keep current UI working; tighten later to `authenticated` if/when auth is added. Update/Delete restricted to `service_role`.
  - Indexes: `created_at` for recent-first queries.

- journal_entries:
  - Purpose: Store personal journal/status entries via server action (JWT-gated at app layer) and display them publicly.
  - Columns: `id (uuid pk)`, `entry_text`, `status_text`, `published (bool)`, `created_at (timestamptz)`.
  - RLS: Allow anon insert (server-side action handles JWT). Allow select for anon to render on site. Update/Delete restricted to `service_role`.
  - Indexes: `created_at`, optional partial index on `(published)` if needed.

- admin_passwords (already present):
  - Purpose: Store 3 bcrypt-hashed admin passphrases for app-level auth (JWT issuance).
  - Current State: Migrations exist (`20240320000000_*.sql` and `20240331_admin_passwords.sql`). Keep as-is.

- users (typed, not actively used yet):
  - Purpose: Future user modeling for roles or ownership.
  - Columns (minimal): `id (uuid pk)`, `email (unique)`, `full_name`, `role`, `created_at`, `updated_at`.
  - RLS: Default-restrict (service_role only) until auth is introduced.

## Phase 2: Content & Portfolio (future-friendly)

- projects, project_media, project_links, project_features:
  - Map to `src/types/projects.ts` (ProjectSummary/ProjectFull and media model).
  - Rationale: Currently seeded from `src/data/projects` and `/public/projects` assets. DB-backed would enable adding/editing via an admin surface and richer querying.
  - Suggested tables:
    - `projects (id uuid pk, slug unique, title, tagline, description, client, role, location, tech text[], tags text[], weight int, status, is_highlight bool, has_case_study bool, started_at date, ended_at date)`
    - `project_media (id uuid pk, project_id fk, type enum('image','video'), src, alt, featured bool, variant enum('light','dark'), base_key, autoplay bool, loop bool, muted bool, plays_inline bool, width int, height int)`
    - `project_links (id uuid pk, project_id fk, type enum('live','repo','case-study','design','docs','github'), url, label)`
    - `project_features (id uuid pk, project_id fk, title, summary, details text[], category, badges text[])`
  - RLS: Read for anon; write for service_role initially.

- services:
  - From `src/data/services.ts`. Simple table to list offerings.
  - `services (slug pk, title, summary)`
  - RLS: Read for anon; write for service_role.

- site_settings / about_content:
  - From `src/config/site.ts` and `src/config/about.ts`.
  - Keep config in code for now. If editorial control is desired, introduce JSONB-backed tables:
    - `site_settings (id uuid pk, data jsonb)`
    - `about_content (id uuid pk, data jsonb)`
  - RLS: Read for anon; write for service_role.

## RLS Approach (initial)

- Keep the app working with current client patterns by allowing `anon` to select where the UI queries directly from the browser (contact_submissions, journal_entries). Tighten to `authenticated` once auth is in place.
- Restrict writes (update/delete) to `service_role` for safety, while allowing required `insert` from `anon`.
- Consider adding dedicated public views later if we want to restrict columns for public reads.

## Migration Summary (Phase 1)

- Create `contact_submissions`, `journal_entries`, and minimal `users` with indexes and RLS/policies aligned to usage today.
- Leave `admin_passwords` as-is.

