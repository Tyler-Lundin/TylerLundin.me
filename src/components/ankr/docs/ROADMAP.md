# Ankr — Roadmap

## MVP (Docs + Skeleton)
- Finalize proposal, schema, APIs, and UX docs
- Create tables via migrations (topics, snippets, threads, messages, citations)
- Build dev-only endpoints for topics/snippets CRUD
- Wire a non-LLM mock responder for UI plumbing

## V1 (Grounded Chat)
- Add retrieval pipeline (topic + recency + weight)
- Implement streaming assistant with citations
- Attach topics to threads; pin chips in UI
- Admin tools to add/import snippets from files/URLs

## V2 (Smarter Context)
- Embeddings + re-ranking for snippets
- Automated ingestion for repo/code/docs (opt-in)
- Scratchpad expiration + promote-to-snippet flows
- Observability (metrics, logs) + evaluation harness

## Nice-to-haves
- Snippet supersession/versioning
- Read-only public demo mode with safe topics
- Multi-model routing and fallbacks

