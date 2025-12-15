# Ankr — Roadmap

## Now (UI Feel-First)
- Fullscreen Ankr Menu overlay with chat skeleton (done)
- Character button toggle + Cmd/Ctrl+J + Esc (done)
- Focus management: input autofocus + basic trap (done)
- Message list + composer; mock assistant replies (done)
- Topic chip placeholders and header states (done)

## Next (Useful Interactions)
- Quick-add snippet from selection; confirm dialog
- Inline citations row under assistant messages (UI only)
- Thread pin: attach/detach topics (UI state only)
- Minimal settings popover (model, tone presets) — non-functional

## MVP Backend
- Supabase tables per SCHEMA with RLS (dev-only)
- /api/ankr/topics, /snippets, /threads (CRUD)
- /api/ankr/chat (keyword + recency ranking, no embeddings)
- Store messages + citations; return streaming response

## V1
- Embedding indexing + re-ranking for snippets
- Snippet anchors (file path + line ranges, URL fragments)
- Scratchpad mode with auto-expire + promote-to-snippet
- Topic facets (status, priority) and quick filters

## V2
- Automated ingestion (docs/code scanners) with opt-in saves
- Evals dashboard for retrieval grounding quality
- Rich admin tools: merge topics, supersede snippets

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
