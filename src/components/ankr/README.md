# Ankr — Dev Assistant (Proposal Overview)

Ankr is a developer-sidekick for this site: a contextual chat assistant that knows the codebase, content, and active projects, and can suggest ideas while neatly tagging and storing context for later use. Think friendly, fast, and helpful—like a little game companion that offers hints, remembers threads, and references specific areas of the site.

## Vision
- Give actionable ideas grounded in this repo’s data.
- Persist neatly tagged context: projects, features, SEO, notes.
- Act like a sidekick (playful, concise, on-task), not a generic chatbot.
- Be privacy-aware and transparent about what it stores and why.

## Core Concepts
- Context Topics: a typed registry (e.g., Project, Feature, SEO, Content).
- Context Snippets: small, source-linked records (text or JSON) tagged to topics.
- Threads & Messages: chat history with topic attachments and citations.
- Retrieval: rank relevant snippets per turn; stream grounded responses.

## Deliverables (Docs-first)
- docs/PROPOSAL.md — high-level architecture & flow
- docs/SCHEMA.md — tables, columns, and RLS approach
- docs/API.md — server actions/routes, streaming & retrieval
- docs/UX.md — sidekick behavior, components, and states
- docs/ROADMAP.md — phases and milestones

Implementation starts only after agreement on this plan.

