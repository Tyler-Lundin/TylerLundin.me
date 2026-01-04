# Web Dev CLI Plan (/dev + ` toggle)

## Objective

Provide an in-browser developer CLI accessible at `/dev` and toggled with the backtick/tilde key. It should run a small command registry that proxies to backend actions (search, enrich, export), reusing the same code paths as the Node CLI where possible.

## UX

- Global Toggle: Attach a `keydown` listener for the backtick key to open/close an overlay.
- Route: A dedicated `/dev` page with the terminal mounted, plus global overlay access.
- Terminal UI: Simple input, history, output stream; consider `xterm.js` or a lightweight custom input + log.
- Auth: Protect behind local-only condition, feature flag, or simple password to avoid public exposure.

## Commands (MVP)

- `search --niches=... --locations=... --max=...` → triggers ingestion job; streams progress.
- `status` → shows last job summaries.
- `export --format=csv/json --filter=...` → downloads file.

## Implementation Sketch

- Frontend: Terminal component, keyboard toggle, command parser, request/response rendering.
- Backend: API route(s) that call into a shared module (the same TS implementation used by the CLI). For a Next.js site, create API handlers under `/pages/api/dev-cli/*` or `/app/api/dev-cli/*` and import the shared `leadgen` library functions.
- Shared Code: Keep ingestion/enrichment logic in the `leadgen` package (this folder) and export callable functions. Both the Node CLI and web API can import these.
- Safety: Rate-limit and guard with env flag (e.g., `DEV_CLI_ENABLED=1`).

## Next Steps

1. Expose ingestion as a callable function (already in `src`), harden inputs.
2. Add a minimal API handler in the site that invokes ingestion with supplied args.
3. Build a tiny terminal overlay + `/dev` route and wire the backtick toggle.
4. Add auth/guard and basic logs.

