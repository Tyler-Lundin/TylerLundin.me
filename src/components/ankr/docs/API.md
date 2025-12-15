# Ankr — API & Server Actions

Focus on server-side composition: fetch topics/snippets, retrieve relevant context, and stream grounded chat responses. All endpoints are dev/admin-only for now.

## Endpoints (Next.js route handlers or server actions)

### POST /api/ankr/chat
- body: { threadId?, message: string, attachTopicIds?: uuid[] }
- behavior:
  - Ensure thread exists; optionally attach topics
  - Retrieve snippets by topicId, recency, weight; optional embeddings
  - Optional: include prior threads (by overlapping topics) and recent messages of this thread
    - flags: includePrevThreads? (default true), includeThreadMessages? (default false), threadMessagesLimit?
  - Stage 1: Analyze user message into {category, goal, relatedTo[]}
  - Stage 2: Generate assistant response + recommendedActions[] (from config), with prior thread context
  - Persist assistant message + citations
- returns (JSON for now): { threadId, userMessageId, assistantMessageId, assistantContent, citations[], analysis, recommendedActions[] }
  - Note: Switch to SSE streaming once provider is wired.

### POST /api/ankr/automation/suggest
- body: { analysis: { category, goal?, relatedTo?[] }, availableActions: string[] }
- behavior: returns auto-recommended actions based on simple rules; no execution.
- returns: { autoActions: string[], rationale?: string }

### POST /api/ankr/actions
- body: { threadId?, sourceMessageId?, requestedBy?: 'assistant'|'user'|'system', actions: { name: string, params?: any }[] }
- behavior: records one or more requested actions in `ankr_action_calls` with status `requested`.
- returns: { actions: Action[] }

### POST /api/ankr/actions/:id/ack
- body: { acknowledgedBy?: string }
- behavior: marks the action as `acknowledged` by an executor; used to claim work.
- returns: { action }

### POST /api/ankr/actions/:id/complete
- body: { status: 'succeeded'|'failed'|'cancelled', executedBy?: string, statusInfo?: any }
- behavior: completes the action request and records metadata.
- returns: { action }

## Tables
- `ankr_action_calls`: bridge/fuse between AI suggestions and real function execution.
  - Fields: id, thread_id, source_message_id, requested_by, action_name, params, status, status_info, correlation_id, acknowledged_by, executed_by, executed_at, created_at, updated_at.

## Ankr Config
- File: `src/lib/ankr/config.ts`
- Contains:
  - `categories`: predefined list used in analysis
  - `actions`: available action names the AI may recommend
  - `models`: analyze/respond model names
  - `systemPrompts`: system messages for analyze/respond stages

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

## Logging
- Enable human-readable logs with `ANKR_DEBUG=true` (server env).
- Chat route prints a compact multi-line block per request, e.g.:
  - `▶︎ ANKR CHAT (req_ab12cd34)`
  - `  In.msg: "…" (len)`
  - `  In.thread: new|reuse <id>`
  - `  In.attachTopics: N`
  - `  Pinned topics: N`
  - `  Retrieval: candidates N • order=weight→recency • top=<source>`
  - `  Persist: user msg saved (<id>)`
  - `  Persist: assistant msg saved (<id>) len=…`
  - `  Citations: saved N`
  - `  Out.model: <model|synth>`
  - `  Out.msg: "…"`
  - `  Time: XXXms`
### POST /api/ankr/actions/:id/execute
- body: { executor?: string }
- behavior: runs the mapped handler for the action (transitions requested→running→succeeded|failed). Idempotent for terminal states.
- returns: { action }

### POST /api/ankr/actions/pump
- body: { limit?: number, executor?: string }
- behavior: processes up to `limit` requested actions FIFO; dev-only convenience.
- returns: { processed, results: [{ id, status? , error? }] }

### GET /api/ankr/actions/:id/stream
- behavior: streams action status via Server-Sent Events. Emits `message` with { id, status }, periodic `ping`, and `end` when terminal or timeout.
- returns: text/event-stream
