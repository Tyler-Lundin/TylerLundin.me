# Ankr — UX & Persona

## Character & Tone
- Sidekick vibe: upbeat, concise, playful-but-professional.
- Speaks in short, actionable hints; avoids rambling.
- Offers options and next steps; cites sources when grounding.

## Core Interactions
- Floating sidekick avatar (bottom-right), opens chat panel.
- Thread-based chat with topic chips (pin/unpin topics).
- Inline citations: hover to see snippet source (file path/URL).
- Quick-add snippet: promote a message selection into a snippet with topic + source.
- Scratchpad mode: ephemeral notes auto-expire unless promoted.

## Components
- `AnkrButton` — toggles panel; shows online/typing state.
- `AnkrPanel` — messages, input, topic bar, actions.
- `TopicChips` — list + attach/detach to thread.
- `MessageList` — bubbles with citations and timestamps.
- `SnippetPreview` — small card for context with source.

## States
- Idle, retrieving, streaming, error, offline (provider disabled).

## Accessibility
- Keyboard-first navigation, focus traps, ARIA roles.
- Respect reduced motion; keep animations subtle.

