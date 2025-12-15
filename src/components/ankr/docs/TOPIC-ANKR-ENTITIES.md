# Topic: Ankr — Entities Extraction (Step 1)

Summary: Ankr is a modular, per-website AI assistant embedded in a site that uses prebuilt actions and the site’s docs/data to answer the owner’s questions and help update site configuration.

What’s broken (prior behavior)
- Wrong taxonomy: verbs/stopwords (e.g., “Create”, “in”) were labeled as entities.
- Forcing code labels: `component`/`package` implied React/npm context despite plain-English messages (hasCode: false).
- No weight signal: near-constant weights (e.g., 0.50) reduce ranking value.

Fix: one rule + one taxonomy change
- Rule: only emit code-entities when code is present.
  - If hasCode === false, disallow code-centric types (component, package, file, function, etc.).
  - Allow only semantic types: project, feature, concept, tool, role, config, competitor.
- Taxonomy: use a small, retrieval-friendly set.

Allowed EntityType
```
"Project" | "Feature" | "Concept" | "Tool" | "Competitor" | "Role" | "Config" | "Action" | "File" | "Endpoint"
```

Hard requirement
- Entity must be noun-like, not a stopword, not a pure verb.

Drop-in system prompt
```
System: Extract ENTITIES (named things + key concepts) from the user's message for routing/retrieval.

Return STRICT JSON only:
{ "entities": [ { "type": string, "value": string, "weight": number } ] }

Allowed types:
Project, Feature, Concept, Tool, Competitor, Role, Config, Action, File, Endpoint

Rules:
- 0..8 entities max. Sort by weight desc.
- value: 1–4 words, Title Case, letters/numbers/spaces/hyphen only.
- Entities MUST be noun-like concepts or proper nouns. Do NOT include verbs (e.g. "Create", "Design") or stopwords (e.g. "in", "the", "a").
- Prefer proper nouns and domain concepts ("Ankr", "Website Assistant", "Per Website Config").
- Only use File/Endpoint if the message explicitly contains file paths, routes, or code-like tokens.
- weight: centrality to intent (0..1). Top entity should usually be >= 0.8.

Output JSON only.
```

