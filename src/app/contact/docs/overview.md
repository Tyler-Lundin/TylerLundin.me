# Contact & Quotes App Docs

- submitContact: validates user input (zod) and inserts into `contact_submissions`.
- submitQuote: validates structured quote input and inserts into `quote_requests`.

Data privacy
- RLS is currently permissive for anon select to match existing /dev client-side queries; tighten to `authenticated` later.

Admin UX ideas
- Unified Inbox with filters: type (contact/quote), status, date, tag.
- Bulk updates: mark triage/closed, add internal notes (quotes).

Migration
- Defined in `supabase/migrations/20251219093000_contacts_quotes.sql`.
- Proposal at `supabase/proposals/contacts_quotes.md`.

