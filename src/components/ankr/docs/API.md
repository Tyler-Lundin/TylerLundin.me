# Ankr — API & Server Actions

Focus on server-side composition: fetch topics/snippets, retrieve relevant context, and stream grounded chat responses. All endpoints are dev/admin-only for now.

## Endpoints (Next.js route handlers or server actions)

### POST /api/ankr/chat
- body: { threadId?, message: string, attachTopicIds?: uuid[] }
- behavior:
  - Ensure thread exists; optionally attach topics
  - Retrieve snippets by topicId, recency, weight; optional embeddings
  - Generate and stream assistant response with citations
  - Persist assistant message + citations
- returns: { threadId, messageId } and a text/event-stream for content

### GET /api/ankr/topics
- query: { q?, kind? }
- returns: list of topics

### POST /api/ankr/topics
- body: { kind, slug, title, description }
- returns: created topic

### GET /api/ankr/snippets
- query: { topicId, q?, limit? }
- returns: matching snippets

### POST /api/ankr/snippets
- body: { topicId, sourceKind, sourceRef, content, private?, weight? }
- returns: created snippet

### POST /api/ankr/threads
- body: { title?, topicIds? }
- returns: created thread

### GET /api/ankr/threads/:id
- returns: thread details, attached topics, last N messages

## Retrieval Pipeline
1) Build constraints from thread + attached topics + user message
2) Fetch candidates: topic-filtered snippets
3) Rank by: pinned topics first, weight desc, recency desc
4) Optional: embedding similarity re-rank
5) Truncate to context budget and pass to model

## Streaming
- Server-Sent Events (SSE) or Next’s streaming response.
- Chunks include text deltas and optional citation markers.

## Errors
- Structured JSON: { code, message, details? }
- Graceful fallback to non-embedding retrieval if vectors unavailable.

