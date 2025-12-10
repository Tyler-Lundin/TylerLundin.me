# Admin Auth + SSR Plan

This document summarizes the current admin authentication setup, SSR enforcement, and a path to introduce Supabase Auth for clients while keeping the 3-password admin gate.

## Current Admin Auth (kept)

- Challenge: 3 passwords in `public.admin_passwords` (bcrypt-verified in API).
- On success: issue a short-lived JWT (cookie `auth_token`) signed with `JWT_SECRET`.
- Middleware: protects `/dev/:path*` and `/api/admin/:path*` by verifying `auth_token`.
- SSR guard: `/app/dev/layout.tsx` calls `requireAdmin()` (server-side) and `redirect('/login?redirect=/dev')` if invalid.
- Logout: `POST /api/auth/logout` clears the cookie and returns success.

Files of note:
- `src/app/api/auth/verify/route.ts` – checks 3 hashes and sets cookie.
- `src/lib/auth.ts` – `requireAdmin()` helper for server components.
- `src/middleware.ts` – request-time protection.
- `src/app/dev/layout.tsx` – SSR gate for all dev routes.
- `src/app/api/auth/verify-token` and `logout` – diagnostics + logout.

## SSR Coverage

- `/dev/*` – SSR-gated in layout (no client-side flicker). Nested client modules still work.
- `/dev/blog/[slug]` – already server-rendered and uses `requireAdmin()`.
- Public blog routes (`/blog`, `/blog/[slug]`) – server-rendered with Supabase reads.

## Option A: Stay with App-level JWT for Admin

Pros: Simple, no change to RLS or Supabase Auth. Works with current policies where admin writes occur via service-role server API/routes.

Actions:
- Keep `service_role` for admin writes (posts, comments moderation, project ops).
- Gradually tighten anon policies as we move writes fully server-side.

## Option B: Introduce Supabase Auth (Clients) + 3-Password Admin Gate

Goal: Clients get accounts to access their projects; Admin still uses the 3-passwords gate.

Approach:
1. Enable Supabase Auth (email magic link or passwordless OTP).
2. Keep the 3-password flow for Admin; on success, continue using the app JWT for dev/admin.
3. For clients, authenticated Supabase sessions will hit RLS policies based on `auth.uid()` (already used in `project_memberships` policy).
4. UI: add client login/portal separate from `/dev` (e.g., `/dashboard`).

RLS Alignment:
- `projects_member_select` already checks `auth.uid()` to allow members to read their projects.
- Add further policies for invoices/payments reads for the project members as needed.

Optional (advanced): Mint a Supabase session after 3-password admin login by calling the Auth admin API (GoTrue) and setting a session cookie—but this adds complexity and isn’t necessary if admin writes remain through service routes.

## Near-Term Tasks

1. Tighten policies where feasible:
   - Keep anon SELECT for public blog and public content; route admin writes through server endpoints using `service_role`.
2. Add server actions for common writes with `requireAdmin()` checks (e.g., blog upsert, comments moderation).
3. Add a compact status indicator in the Dev header to show auth validity and environment.
4. Add `/dashboard` (client portal) placeholder for eventual Supabase-authenticated client access.

## Notes

- We keep the 3-password admin gate permanently for admin entry. Supabase Auth is introduced for clients only.
- Middleware + SSR layout provides double protection without flicker.

