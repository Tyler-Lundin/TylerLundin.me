# Services Source of Truth

This directory defines what a “service” is for the site and contains the single source of truth for:

- Root `Service` interface and related enums
- Validation schema for compile-time and runtime safety
- The canonical services table (data set)
- Lightweight access helpers
 - Bundles: definitions, schema, and data

## Fields

Minimum required:
- `slug`: URL-friendly unique id (e.g. `web-hosting`)
- `title`: Display name
- `summary`: One–sentence description

Optional, for richer rendering later:
- `category`: Broad grouping (e.g. `hosting`, `design`, `branding`, `data`, `auth`, `general`)
- `status`: Lifecycle (`active`, `draft`, `hidden`)
- `tags`: Freeform keywords used for filtering
- `features`: Short bullets that describe value
- `priceRange`: Human-readable price summary (e.g. `from $49/mo`, `project-based`)
- `cta`: Optional primary call to action
- `updatedAt`: ISO string for last editorial update

## Conventions

- Keep `slug` stable; it’s used for routing and lookups.
- Prefer concise `summary` text (under ~140 chars) — it’s used in cards and previews.
- Use the schema (`serviceSchema`) to validate any new records locally.

## Access

Import from this module rather than ad-hoc data files:

- Types: `import type { Service } from '@/services'`
- Data: `import { services, getServices } from '@/services'`
 - Bundles: `import { bundles, getBundles } from '@/services'`

## Bundles

Bundles package multiple services together with pricing context.

Minimum fields:
- `slug`: Kebab-case unique id
- `title`: Display name
- `summary`: One–two sentence description
- `serviceSlugs`: Array of included service slugs

Optional fields:
- `priceRange`: Human-readable price summary (e.g. `from $499 + $15/mo`)
- `prices`: Structured rows for exact amounts
- `billing`: One of `monthly | one_time | project`
- `features`: Bulleted value points
- `tags`, `cta`, `status`, `updatedAt`

Helpers:
- `expandBundle(bundle, services)`: returns `{ ...bundle, services: Service[] }`
