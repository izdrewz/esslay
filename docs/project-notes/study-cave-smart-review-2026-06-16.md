# Study Cave Smart Review layer — 2026-06-16

## Status

First real Grammarly-like Study Cave support layer added.

Implemented in:

- `docs/study-cave-test-mode-v1.js`

This file already loads on `docs/cave.html`, so the feature is active without changing the core cave route files.

## What changed

The Cave Coach now includes a Smart Review card.

Smart Review can be opened from the left floating Cave Coach tab and lets Izzy paste a paragraph or draft into a local browser-saved review box.

Local storage key:

- `esslay-study-cave-smart-review-v1`

## Current checks

This is still local rule-based checking, not a live AI model.

It currently checks for:

- missing draft text
- draft too short for meaningful review
- weak task match against Brief Fog task keywords
- vague opening claim / missing answer signal
- long sentences over roughly 36 words
- missing visible evidence support
- saved evidence gems not used in the pasted draft
- citation / page-number risk when a quote or citation appears
- heavy first sentence in a long paragraph
- weak transitions across multiple paragraphs
- wordiness / filler phrases
- repetitive sentence starts

## User-facing behaviour

The Smart Review panel shows:

- score out of 100
- word count
- task-term match count
- source count
- evidence gem count
- actionable suggestion cards
- red / amber / green severity labels
- short fix instructions
- route-room labels for where to fix the issue

## Important limitation

This is a client-side rule-based assistant. It is meant to feel more like Grammarly-style guidance, but it does not yet call an AI model and cannot truly understand a full essay.

The next stronger version should connect the checks to actual route rooms:

- Brief Fog: task/question match
- Source Mine: evidence sufficiency
- Draft Route: structure and claim order
- Paragraph Forge: topic sentence + PEEL/TEA-style paragraph shape
- Bridge Hall: transition and flow
- Citation Vault: citation completeness and quote integration
- Polish Pool: wordiness, repetition, sentence length
- Submission Gate: final checklist

## Test

Open:

- `docs/cave.html`

Hard refresh with Ctrl + F5.

Expected:

- left Cave Coach tab opens
- Cave Coach shows a Smart Review card
- Open writing checks opens Smart Review
- pasting a paragraph and clicking Save + run checks updates the score and suggestion list
- route buttons inside Smart Review still open cave rooms
- Test Mode remains available from Cave Coach
