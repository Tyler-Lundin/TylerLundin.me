# Local Supabase via Docker (Compose)

This project uses Supabase’s local stack for development. The easiest and most reliable way to run it is via the Supabase CLI, which manages a Docker Compose stack for you.

## Prereqs

- Docker Desktop (or daemon) running
- Supabase CLI installed: https://supabase.com/docs/guides/local-development/cli/getting-started

## Start the stack

1) From the repo root:

   - `make supabase-start` (or run `supabase start`)

   This launches Postgres, Auth, PostgREST, Realtime, Storage, Studio, and Inbucket. Ports follow `supabase/config.toml`:

   - API: `http://127.0.0.1:54321`
   - DB: `127.0.0.1:54322`
   - Studio: `http://127.0.0.1:54323`
   - Inbucket: `http://127.0.0.1:54324`

2) Apply migrations (if not applied automatically):

   - `supabase migration up`

3) Seed (optional): the config enables `supabase/seed.sql` during `db reset`. You can also run psql or Studio.

## App environment

Copy `.env.example` → `.env.local` and set these to local values while developing:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=replace-with-local-service-role-key
```

Notes:
- The CLI prints `anon` and `service_role` keys on `supabase start`. You can also find them in Studio → Settings → API.
- The dev CRM migration uses RLS. To test admin flows, create an admin profile row in `crm_profiles` for your `auth.users.id`.

## Useful commands

- Start: `make supabase-start`
- Stop: `make supabase-stop`
- Reset: `make supabase-reset` (drops data, reapplies migrations, and seeds if enabled)

## Troubleshooting

- If ports 54321–54324 or 54322 are in use, adjust `supabase/config.toml` and restart.
- If migrations fail, check `supabase/migrations/*` ordering and dependencies.

