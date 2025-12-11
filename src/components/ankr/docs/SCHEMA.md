# Ankr — Data Model (Supabase)

Tables are designed for clean topic-centric context management. RLS defaults restrict writes to service/admin roles; public read is off by default for dev surfaces.

## Tables

### ankr_topics
- id uuid pk
- kind text check in ('project','feature','seo','content','note','other')
- slug text unique
- title text
- description text
- created_at timestamptz default now()
- updated_at timestamptz

### ankr_snippets
- id uuid pk
- topic_id uuid fk -> ankr_topics.id
- source_kind text check in ('file','url','note','other')
- source_ref text (e.g., file path, URL, or freeform key)
- content text (or jsonb if needed later)
- private boolean default true (dev-only by default)
- weight int default 0 (manual priority)
- created_at timestamptz default now()

### ankr_threads
- id uuid pk
- title text
- created_by text (email or user id; dev-only now)
- created_at timestamptz default now()

### ankr_thread_topics
- thread_id uuid fk -> ankr_threads.id
- topic_id uuid fk -> ankr_topics.id
- pinned boolean default true
- created_at timestamptz default now()
PRIMARY KEY (thread_id, topic_id)

### ankr_messages
- id uuid pk
- thread_id uuid fk -> ankr_threads.id
- role text check in ('user','assistant','system')
- content text
- model text null (for assistant)
- created_at timestamptz default now()

### ankr_message_citations
- message_id uuid fk -> ankr_messages.id
- snippet_id uuid fk -> ankr_snippets.id
- rank int (0-based)
PRIMARY KEY (message_id, snippet_id)

### ankr_embeddings (optional)
- snippet_id uuid pk fk -> ankr_snippets.id
- embedding vector (provider-specific or float[])
- dim int
- updated_at timestamptz

## Indexes (suggested)
- ankr_snippets(topic_id, created_at desc)
- ankr_message_citations(message_id, rank)
- ankr_thread_topics(thread_id)

## RLS (initial)
- ankr_* tables: select/insert/update restricted to service_role; open to authenticated admins if/when app auth is added.
- Consider creating read-only views for demo surfaces later.

## Notes
- Start with keyword + topic filters; add embeddings later if needed.
- Prefer immutability for snippets; edits create a new snippet with supersedes pointer (optional future field) to preserve provenance.

