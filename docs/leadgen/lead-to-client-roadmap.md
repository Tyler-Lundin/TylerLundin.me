# Lead → Client Conversion and Sales Toolkit

## Objectives
- Convert a single lead into a structured CRM client with minimal friction.
- Launch a ready-to-work project scaffold from that client.
- Provide focused sales tools (call, email, follow-ups) that are quick, consistent, and logged.

## One-Click Initialization
- Client Wizard
  - Prefill: name, phone, website/domain, address, niche, location from `leads`.
  - Create: `crm_clients` (+ optional primary contact in `crm_contacts`).
  - Link: record `lead_id → client` (either `crm_clients.lead_id` or a `lead_client_links` table).
  - Tags/Notes: import `lead_filter_results` (e.g., `no-website`, `website_swipe:keep`).
- Project Wizard
  - Prefill: title from niche + company/domain (e.g., “Dental Website Redesign – Capstone247”).
  - Template: leverage `src/services/bundles.ts` (Website Redesign – Basic/Pro).
  - Create: `crm_projects` (status: planned), link to `client_id`, attach selected bundle/services.
  - Seed Tasks: initial checklist (discovery call, site audit, content inventory, timeline).
- Idempotency
  - If a client exists for this `lead_id` or domain, offer merge/attach instead of duplicate.
  - If a similar active project exists, offer “Open existing” or “Create another”.

## Sales Tooling (Plan First)
- Call Assist
  - One-click tel link + in-app call timer + outcome logger.
  - Modular scripts: opener, discovery, value pitch; variables from niche/site status.
  - Outcomes → `lead_events`: `call_outcome` (no answer/voicemail/connected/booked), `next_follow_up_at`; update `leads.status`.
- Email Assist
  - Templates: “No Website”, “Needs Redesign”, “Performance/SEO uplift”.
  - Personalization helpers: first 2 lines, pain-point bullets (from reviews/website cues).
  - Send via `src/lib/email.ts` (Resend); log to `lead_events` with `message_id`.
  - Sequences: simple 3-step cadence; show next due; allow skip/advance.
- Collateral
  - Quick Audit: checklist (mobile/UX/CTA/findability) with suggested remarks; later Lighthouse snapshot.
  - Case Studies: auto-pick 1–2 relevant from `src/data/projects.ts` to include.
- Scheduling
  - “Book a call” CTA (booking link); store `last_contacted_at` + next follow-up.
- Guardrails
  - Use only public business contacts; include opt-out note in templates.

## Lead Page UX (V1)
- Header: name, location, phone, website, reviews.
- Actions: “Initialize Client + Project”, “Open Swipe”, “Open Website”.
- Left
  - Client/Project Summary: creates or links; badges for status.
  - Groups: list with links; add-to-group control.
  - History: `lead_events` (decisions, calls, emails, notes).
- Right
  - Call Assist: script, timer, outcomes, next step.
  - Email Assist: template picker, preview, personalize fields, send/schedule.
  - Follow-ups: date picker + quick status tags.
- Footer: Notes (freeform; logs to `lead_events`).

## Data Model & Migrations
- Linkage Options
  - A) `crm_clients.lead_id uuid unique null` (simplest), or
  - B) `lead_client_links(lead_id uuid, client_id uuid, created_at)` unique on `(lead_id, client_id)`.
- Projects
  - Ensure `crm_projects(client_id, title, status, bundle_key, notes)`.
  - `crm_project_tasks` (seed checklist) with minimal fields: `(project_id, title, status, order)`.
- Events
  - Reuse `lead_events` with types: `call_outcome`, `email_sent`, `meeting_booked`, `status_change`, `note`.
- Statuses
  - `leads.status`: `new`, `queued`, `contacted`, `interested`, `in_progress`, `won`, `lost`.
- RLS
  - Admin-only access consistent with existing LeadGen policies.

## Group Scoring (Already Implemented)
- Heuristic by review count:
  - 1–20: best (score 3)
  - 21–50: okay (score 2)
  - 50+: hard (score 0.5)
  - 0: low signal (score 0.5)
- Group score = average of member scores; sorted desc, then by size.

## Implementation Steps
1) Schema: add lead→client mapping and minimal project/task scaffolds.
2) Lead page: “Initialize Client + Project” wizard (idempotent checks by `lead_id`/domain).
3) Call Assist: scripts, timer UI, outcomes → `lead_events`, `leads.status` update.
4) Email Assist: templates, personalization, send/log, simple sequencing.
5) Follow-ups: schedule + dashboard counters; daily digest.
6) Polish: notes feed, case studies picker, quick audit checklist.

## Idempotency & Safety
- Prevent duplicates by domain + `lead_id`.
- Do not overwrite client/project data on re-init; only seed on first pass.
- Keep all actions logged in `lead_events` with timestamps and payloads.

## Nice-to-Haves (Later)
- Smart Queue: auto-prioritize next best action by score and last contact.
- Reader Mode in Swipe: stable website preview for quick assessments.
- Export: CSV for groups/filters and sequence outcomes.

---

Saved at: `docs/leadgen/lead-to-client-roadmap.md`
