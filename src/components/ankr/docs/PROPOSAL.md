# Ankr — Architecture Proposal

Ankr is a contextual dev assistant that chats, suggests ideas, and grounds its responses in the site’s own data. Context is captured as small, source-linked snippets and tagged to typed topics (e.g., Projects, Features, SEO). Conversations reference and enrich this context in the background.

## Goals
- Structured knowledge: Topic registry + tagged snippets with provenance.
- Helpful chat: Streaming answers grounded in retrieved context.
- Gentle persona: Sidekick tone; concise and proactive with hints.
- Privacy-first: Explicit storage, transparent citations, reversible.

## Constraints & Assumptions
- Next.js app with server actions/route handlers available.
- Supabase available for persistence and RLS.
- LLM provider to be pluggable; start with mock/local for dev.

## Core Model
- Topics: canonical items (project, feature, SEO, content area, misc).
- Snippets: short, immutable-ish records (text/JSON) linked to a topic and optional code/content source.
- Threads: user ↔ ankr conversations with optional topic attachments.
- Messages: chat turns with citations (which snippets were used).
- Embeddings (optional): store vectors for snippet retrieval; fallback to keyword and metadata filters if disabled.

## High-Level Flow
1) User sends a message in a thread
2) Ankr builds a retrieval query from thread + attached topics
3) Retrieve relevant snippets (by topic, recency, and/or embeddings)
4) Generate a response with inline citations (snippet ids)
5) Stream answer; store assistant message + citations
6) If the user or assistant proposes new context, prompt to save as a snippet with topic and source

## Context Strategy
- Keep snippets small and focused with provenance: file path, URL, or manual note.
- Prefer explicit opt-in when saving new context from chat.
- Allow pinning topics to a thread and quick-add of snippets.
- Enable ephemeral “scratchpad” snippets that expire unless promoted.

## Integration Surfaces
- Ingestion: API to add/update topics and add snippets (manual or automated).
- Retrieval: API to fetch snippets by constraints; server-side re-ranking.
- Chat: streaming endpoint that composes retrieval + generation.

## Observability
- Log retrieval stats (hit counts, top snippets, latency) per turn.
- Keep simple counters for topic/snippet utilization.

## Security & Privacy
- RLS restricts writes to admin/service role; public read only where intended.
- Explicitly mark private/internal snippets that never leave dev surfaces.
- Avoid storing raw secrets; redact before saving.

## Phasing
- MVP: Topic registry, snippet add/list, basic chat with keyword retrieval.
- V1: Embeddings + re-ranking, thread-topic association, citations UI.
- V2: Automated ingestion (code/docs scanning), evals, richer admin tools.

