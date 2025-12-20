# Contacts and Quotes Proposal

## Goals

- Centralize inbound communication into two clear entities: general contact messages and structured quote requests.
- Support admin/dev viewing, filtering, and managing items in /dev without introducing server-only dependencies immediately.
- Keep data privacy in mind; allow tightening RLS later without breaking existing UI.

## Entities

- contact_submissions (existing): Unstructured messages from the contact form.
- quote_requests (new): Structured requests with budget, timeline, scope.

## Tables

1) contact_submissions (augment existing)
- id: uuid pk default gen_random_uuid()
- name: text not null
- email: text not null
- phone: text null
- subject: text null
- message: text not null
- budget: text null
- source: text null -- e.g., site, referral, linkedin
- status: text default 'new' -- e.g., new, triage, closed
- handled_at: timestamptz null
- handled_by: text null
- created_at: timestamptz default now()
- updated_at: timestamptz default now()

Indexes
- created_at desc (recency)
- status (filtering)

RLS
- Insert: anon (public form)
- Select: anon (to support current dev UI which queries client-side)
- Service role: full

2) quote_requests (new)
- id: uuid pk default gen_random_uuid()
- contact_name: text not null
- contact_email: text not null
- company: text null
- phone: text null
- project_summary: text not null
- scope: jsonb null -- free-form features/modules list
- budget_min: integer null
- budget_max: integer null
- currency: text default 'USD'
- timeline: text null -- e.g., 4–6 weeks
- priority: text null -- e.g., low/medium/high
- status: text default 'new' check in ('new','triage','quoted','won','lost','archived')
- source: text null -- acquisition channel
- tags: text[] null
- internal_notes: text null
- created_at: timestamptz default now()
- updated_at: timestamptz default now()

Indexes
- created_at desc (recency)
- status (filtering)
- gin(tags) (tag search)

RLS
- Insert: anon (public quote form if used client-side)
- Select: anon (keeps parity with current client-side dev admin; can be tightened later)
- Service role: full

## API / Actions (app)

- submitContact(formData): validate via zod, insert into contact_submissions.
- submitQuote(formData): validate via zod, insert into quote_requests.
- Both should support spam heuristics in UI (honey-pot field, rate-limiting via middleware later).

## Admin UX (/dev)

- Inbox view shows contact_submissions and quote_requests with filters: type, status, date.
- Quick actions: mark as triage/closed, add internal note (quote_requests).

## Future Hardening

- Tighten RLS to `authenticated` for SELECT once admin uses service role or server routes.
- Add email verification and basic anti-abuse (rate limiting by IP, captcha).
- Normalize status via enum, add comment thread table if needed for follow-ups.

